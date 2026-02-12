/**
 * レコメンドシステム メインエントリポイント
 *
 * 2段階構造:
 * Phase 1: 候補生成 → Phase 2: ランキング → 多様性制御 → キャッシュ
 *
 * 設計書: Docs/recommendation-system-design.md
 */

import type { RecommendationOptions, RecommendedItem } from './types'
import { DEFAULT_RANKING_WEIGHTS, DEFAULT_DIVERSITY_OPTIONS } from './types'
import { generateCandidates, getColdStartRecommendations } from './candidate-generation'
import { rankCandidates } from './ranking'
import { applyDiversityConstraints } from './diversity'
import { getCachedRecommendations, cacheRecommendations } from './cache'

/**
 * レコメンドを生成するメイン関数
 *
 * フロー:
 * 1. キャッシュチェック
 * 2. ユーザーの行動履歴チェック → コールドスタート判定
 * 3. Phase 1: 候補生成（3戦略の統合）
 * 4. Phase 2: ランキング（複数シグナル合成）
 * 5. 多様性制御
 * 6. キャッシュ保存
 * 7. 結果返却
 */
export async function generateRecommendations(
  userId: string | null,
  options: RecommendationOptions = {}
): Promise<RecommendedItem[]> {
  const {
    limit = 50,
    excludeItemIds = [],
    useCache = true,
    minScore = 0,
  } = options

  // 未ログインユーザー → コールドスタート
  if (!userId) {
    return getColdStartRecommendationsRanked(limit)
  }

  // 1. キャッシュチェック
  if (useCache) {
    const cached = await getCachedRecommendations(userId)
    if (cached && cached.expiresAt > new Date()) {
      return cached.items
        .filter((item) => item.finalScore >= minScore)
        .filter((item) => !excludeItemIds.includes(item.itemId))
        .slice(0, limit)
    }
  }

  // 2. Phase 1: 候補生成
  const candidates = await generateCandidates(userId, {
    excludeItemIds,
    candidateLimit: 1000,
  })

  // 候補が少なすぎる場合はコールドスタートで補完
  if (candidates.length < 10) {
    const coldStartItems = await getColdStartRecommendationsRanked(limit)

    if (candidates.length === 0) {
      return coldStartItems
    }

    // 候補生成結果 + コールドスタートを統合
    const ranked = await rankCandidates(candidates, DEFAULT_RANKING_WEIGHTS)
    const diversified = applyDiversityConstraints(ranked, DEFAULT_DIVERSITY_OPTIONS)

    // コールドスタートの中から既に含まれていないものを追加
    const existingIds = new Set(diversified.map((i) => i.itemId))
    const additionalItems = coldStartItems.filter(
      (item) => !existingIds.has(item.itemId)
    )

    const combined = [...diversified, ...additionalItems].slice(0, limit)

    // キャッシュ保存
    if (useCache) {
      await cacheRecommendations(userId, combined, { ttlHours: 6 })
    }

    return combined
  }

  // 3. Phase 2: ランキング
  const ranked = await rankCandidates(candidates, DEFAULT_RANKING_WEIGHTS)

  // 4. 多様性制御
  const diversified = applyDiversityConstraints(ranked, DEFAULT_DIVERSITY_OPTIONS)

  // 5. フィルタリングと制限
  const result = diversified
    .filter((item) => item.finalScore >= minScore)
    .slice(0, limit)

  // 6. キャッシュ保存
  if (useCache) {
    await cacheRecommendations(userId, result, { ttlHours: 12 })
  }

  return result
}

/**
 * コールドスタートレコメンドをランキング付きで取得
 */
async function getColdStartRecommendationsRanked(
  limit: number
): Promise<RecommendedItem[]> {
  const coldStartCandidates = await getColdStartRecommendations(limit * 2)

  if (coldStartCandidates.length === 0) return []

  const ranked = await rankCandidates(coldStartCandidates, {
    collaborativeFiltering: 0.2, // コールドスタートではCFの重みを下げる
    popularity: 0.5, // 人気度を重視
    freshness: 0.3, // 新しさも重視
  })

  const diversified = applyDiversityConstraints(ranked, DEFAULT_DIVERSITY_OPTIONS)

  return diversified.slice(0, limit)
}

// Re-export types
export type { RecommendedItem, RecommendationOptions } from './types'
export { invalidateRecommendationCache } from './cache'

