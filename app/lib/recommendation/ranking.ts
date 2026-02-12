/**
 * Phase 2: ランキング (Ranking)
 *
 * 候補生成で得たアイテムを複数シグナルで順位付けする。
 *
 * ランキング因子:
 * - 協調フィルタリングスコア (40%)
 * - 人気度スコア (30%)
 * - 新規性スコア (20%)
 *
 * 設計書: Docs/recommendation-system-design.md Section 4
 */

import type {
  CandidateItem,
  RecommendedItem,
  RankingWeights,
} from './types'
import { getPopularityScores, getFreshnessScores } from './scoring'

/**
 * 候補アイテムにランキングスコアを付与して順位付け
 */
export async function rankCandidates(
  candidates: CandidateItem[],
  weights: RankingWeights = {
    collaborativeFiltering: 0.4,
    popularity: 0.3,
    freshness: 0.2,
  }
): Promise<RecommendedItem[]> {
  if (candidates.length === 0) return []

  // 人気度データを一括取得（N+1回避）
  const itemIds = candidates.map((c) => c.itemId)
  const popularityMap = await getPopularityScores(itemIds)

  // 新規性スコアを一括計算
  const freshnessMap = getFreshnessScores(
    candidates.map((c) => ({ itemId: c.itemId, createdAt: c.createdAt }))
  )

  // 協調フィルタリングスコアの正規化
  const cfScores = candidates.map((c) => c.totalScore)
  const minCfScore = Math.min(...cfScores)
  const maxCfScore = Math.max(...cfScores)
  const cfRange = maxCfScore - minCfScore || 1

  // 最終スコア計算
  const rankedItems: RecommendedItem[] = candidates.map((candidate) => {
    // 協調フィルタリングスコア（正規化 → 0〜1）
    const normalizedCf = (candidate.totalScore - minCfScore) / cfRange
    const cfComponent = normalizedCf * weights.collaborativeFiltering

    // 人気度スコア（0〜1）
    const popularityScore = popularityMap.get(candidate.itemId) || 0
    const popularityComponent = popularityScore * weights.popularity

    // 新規性スコア（0〜1）
    const freshnessScore = freshnessMap.get(candidate.itemId) || 0.1
    const freshnessComponent = freshnessScore * weights.freshness

    const finalScore = cfComponent + popularityComponent + freshnessComponent

    return {
      itemId: candidate.itemId,
      name: candidate.name,
      imageUrl: candidate.imageUrl,
      shopId: candidate.shopId,
      shopName: candidate.shopName,
      shopTheme: candidate.shopTheme,
      finalScore,
      scoreBreakdown: {
        collaborativeFiltering: cfComponent,
        popularity: popularityComponent,
        freshness: freshnessComponent,
      },
      sources: candidate.sources,
    }
  })

  // スコア降順でソート
  return rankedItems.sort((a, b) => b.finalScore - a.finalScore)
}

