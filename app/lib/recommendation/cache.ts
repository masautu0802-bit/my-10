/**
 * レコメンドキャッシュ管理
 *
 * L1: インメモリキャッシュ（サーバーリクエスト内）
 * L2: PostgreSQLテーブルキャッシュ（12時間TTL）
 * L3: 将来的にRedis追加可能
 *
 * 設計書: Docs/recommendation-system-design.md Section 5.2, 9.3
 */

import { createClient } from '@/app/lib/supabase/server'
import type { RecommendedItem, CacheOptions } from './types'

// ========================================
// インメモリキャッシュ（L1）
// ========================================

/**
 * 簡易インメモリキャッシュ
 * サーバーレス環境では短命だが、同一リクエスト内での重複計算を避ける
 */
const memoryCache = new Map<
  string,
  {
    items: RecommendedItem[]
    expiresAt: number
  }
>()

const MEMORY_CACHE_TTL_MS = 15 * 60 * 1000 // 15分

function getFromMemoryCache(userId: string): RecommendedItem[] | null {
  const entry = memoryCache.get(userId)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(userId)
    return null
  }
  return entry.items
}

function setToMemoryCache(userId: string, items: RecommendedItem[]): void {
  // メモリキャッシュサイズ制限（100ユーザーまで）
  if (memoryCache.size > 100) {
    // 最も古いエントリを削除
    const oldestKey = memoryCache.keys().next().value
    if (oldestKey) memoryCache.delete(oldestKey)
  }

  memoryCache.set(userId, {
    items,
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  })
}

// ========================================
// DBキャッシュ（L2）
// ========================================

/**
 * キャッシュからレコメンドを取得
 * L1（メモリ）→ L2（DB）の順にチェック
 */
export async function getCachedRecommendations(
  userId: string
): Promise<{ items: RecommendedItem[]; expiresAt: Date } | null> {
  // L1: メモリキャッシュチェック
  const memoryResult = getFromMemoryCache(userId)
  if (memoryResult) {
    return {
      items: memoryResult,
      expiresAt: new Date(Date.now() + MEMORY_CACHE_TTL_MS),
    }
  }

  // L2: DBキャッシュチェック
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('recommendation_cache')
      .select('recommended_item_ids, scores, expires_at')
      .eq('user_id', userId)
      .single()

    if (!data) return null

    const expiresAt = new Date(data.expires_at)
    if (expiresAt <= new Date()) {
      // 期限切れ → 削除
      await supabase
        .from('recommendation_cache')
        .delete()
        .eq('user_id', userId)
      return null
    }

    // スコアデータからRecommendedItem[]を復元
    const scores = data.scores as Record<string, unknown>[] | null
    if (!scores || !Array.isArray(scores)) return null

    const items = scores as unknown as RecommendedItem[]

    // L1キャッシュにも保存
    setToMemoryCache(userId, items)

    return { items, expiresAt }
  } catch {
    // recommendation_cacheテーブルが存在しない場合はnullを返す
    return null
  }
}

/**
 * レコメンド結果をキャッシュに保存
 */
export async function cacheRecommendations(
  userId: string,
  items: RecommendedItem[],
  options: CacheOptions = { ttlHours: 12 }
): Promise<void> {
  // L1: メモリキャッシュに保存
  setToMemoryCache(userId, items)

  // L2: DBキャッシュに保存
  try {
    const supabase = await createClient()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + options.ttlHours)

    const itemIds = items.map((i) => i.itemId)

    await supabase.from('recommendation_cache').upsert(
      {
        user_id: userId,
        recommended_item_ids: itemIds,
        scores: items as unknown as Record<string, unknown>[],
        generated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        version: 1,
      },
      { onConflict: 'user_id' }
    )
  } catch {
    // recommendation_cacheテーブルが存在しない場合は無視
    // テーブル作成前でもアプリケーションは動作する
    console.warn('recommendation_cache table not available, skipping DB cache')
  }
}

/**
 * ユーザーのキャッシュを無効化
 * ユーザーが新規アクション（お気に入り、フォロー）を行った際に呼ぶ
 */
export async function invalidateRecommendationCache(
  userId: string
): Promise<void> {
  // L1: メモリキャッシュ削除
  memoryCache.delete(userId)

  // L2: DBキャッシュ削除
  try {
    const supabase = await createClient()
    await supabase
      .from('recommendation_cache')
      .delete()
      .eq('user_id', userId)
  } catch {
    // テーブルが存在しない場合は無視
  }
}

