/**
 * スコア計算ユーティリティ
 *
 * 各ランキング因子のスコアを計算する関数群
 * 設計書: Docs/recommendation-system-design.md Section 4
 */

import { createClient } from '@/app/lib/supabase/server'
import type { PopularityMetrics } from './types'

// ========================================
// 人気度スコア
// ========================================

/**
 * アイテムIDリストに対する人気度スコアを一括計算
 * N+1回避のため、バッチで取得
 *
 * スコア = LOG(1 + favorite_count * 2 + keep_count * 3) / 10
 * Keep保存はお気に入りより強いシグナルとして重み付け
 */
export async function getPopularityScores(
  itemIds: string[]
): Promise<Map<string, number>> {
  if (itemIds.length === 0) return new Map()

  const supabase = await createClient()

  // お気に入り数とKeep保存数を並行取得
  const [{ data: favorites }, { data: keepItems }] = await Promise.all([
    supabase.from('item_favorites').select('item_id').in('item_id', itemIds),
    supabase.from('keep_folder_items').select('item_id').in('item_id', itemIds),
  ])

  // カウント集計
  const favMap = new Map<string, number>()
  favorites?.forEach((f) => {
    favMap.set(f.item_id, (favMap.get(f.item_id) || 0) + 1)
  })

  const keepMap = new Map<string, number>()
  keepItems?.forEach((k) => {
    keepMap.set(k.item_id, (keepMap.get(k.item_id) || 0) + 1)
  })

  // スコア計算
  const scoreMap = new Map<string, number>()
  for (const itemId of itemIds) {
    const favCount = favMap.get(itemId) || 0
    const keepCount = keepMap.get(itemId) || 0
    // LOG(1 + fav*2 + keep*3) / 10 → 0〜1程度に正規化
    const score = Math.log(1 + favCount * 2 + keepCount * 3) / 10
    scoreMap.set(itemId, Math.min(score, 1.0)) // 上限1.0
  }

  return scoreMap
}

/**
 * 人気度メトリクスの詳細を取得
 */
export async function getPopularityMetrics(
  itemIds: string[]
): Promise<Map<string, PopularityMetrics>> {
  if (itemIds.length === 0) return new Map()

  const supabase = await createClient()

  const [{ data: favorites }, { data: keepItems }] = await Promise.all([
    supabase.from('item_favorites').select('item_id').in('item_id', itemIds),
    supabase.from('keep_folder_items').select('item_id').in('item_id', itemIds),
  ])

  const favMap = new Map<string, number>()
  favorites?.forEach((f) => {
    favMap.set(f.item_id, (favMap.get(f.item_id) || 0) + 1)
  })

  const keepMap = new Map<string, number>()
  keepItems?.forEach((k) => {
    keepMap.set(k.item_id, (keepMap.get(k.item_id) || 0) + 1)
  })

  const metricsMap = new Map<string, PopularityMetrics>()
  for (const itemId of itemIds) {
    metricsMap.set(itemId, {
      itemId,
      favoriteCount: favMap.get(itemId) || 0,
      keepCount: keepMap.get(itemId) || 0,
    })
  }

  return metricsMap
}

// ========================================
// 新規性スコア
// ========================================

/**
 * アイテムの新規性（フレッシュネス）スコアを計算
 *
 * 7日以内: 1.0
 * 30日以内: 0.7
 * 90日以内: 0.4
 * それ以上: 0.1
 */
export function calculateFreshnessScore(createdAt: string): number {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const daysDiff = (now - created) / (1000 * 60 * 60 * 24)

  if (daysDiff <= 7) return 1.0
  if (daysDiff <= 30) return 0.7
  if (daysDiff <= 90) return 0.4
  return 0.1
}

/**
 * アイテムIDリストに対するフレッシュネススコアを一括計算
 */
export function getFreshnessScores(
  items: Array<{ itemId: string; createdAt: string }>
): Map<string, number> {
  const scoreMap = new Map<string, number>()
  for (const item of items) {
    scoreMap.set(item.itemId, calculateFreshnessScore(item.createdAt))
  }
  return scoreMap
}

