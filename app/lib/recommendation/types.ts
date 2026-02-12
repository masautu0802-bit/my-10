/**
 * レコメンドシステム型定義
 *
 * 設計書: Docs/recommendation-system-design.md
 * 2段階構造: 候補生成 → ランキング
 */

// ========================================
// 候補生成 (Phase 1) の型
// ========================================

/** 候補生成の元となるソース種別 */
export type CandidateSource = 'item_collab' | 'shop_based' | 'user_based'

/** 候補生成フェーズで生成されるアイテム */
export interface CandidateItem {
  itemId: string
  totalScore: number
  sourceDiversity: number
  sources: CandidateSource[]
  // メタデータ
  name: string
  imageUrl: string | null
  shopId: string
  shopName: string
  shopTheme: string
  createdAt: string
}

/** 候補生成のオプション */
export interface CandidateGenerationOptions {
  excludeItemIds: string[]
  candidateLimit: number
}

// ========================================
// ランキング (Phase 2) の型
// ========================================

/** スコアの内訳 */
export interface ScoreBreakdown {
  collaborativeFiltering: number
  popularity: number
  freshness: number
}

/** ランキング済みのレコメンドアイテム */
export interface RecommendedItem {
  itemId: string
  name: string
  imageUrl: string | null
  shopId: string
  shopName: string
  shopTheme: string
  finalScore: number
  scoreBreakdown: ScoreBreakdown
  sources: CandidateSource[]
}

// ========================================
// レコメンド生成のオプション
// ========================================

/** レコメンド生成のオプション */
export interface RecommendationOptions {
  /** 返却数（デフォルト: 50） */
  limit?: number
  /** 除外アイテムID */
  excludeItemIds?: string[]
  /** キャッシュ使用（デフォルト: true） */
  useCache?: boolean
  /** 最小スコア閾値 */
  minScore?: number
}

// ========================================
// ランキング重み設定
// ========================================

/** ランキング因子の重み */
export interface RankingWeights {
  /** 協調フィルタリングスコアの重み（デフォルト: 0.4） */
  collaborativeFiltering: number
  /** 人気度スコアの重み（デフォルト: 0.3） */
  popularity: number
  /** 新規性スコアの重み（デフォルト: 0.2） */
  freshness: number
}

/** デフォルトのランキング重み */
export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  collaborativeFiltering: 0.4,
  popularity: 0.3,
  freshness: 0.2,
}

// ========================================
// 多様性制御の設定
// ========================================

/** 多様性制御のオプション */
export interface DiversityOptions {
  /** 同一ショップからの最大アイテム数（デフォルト: 3） */
  maxItemsPerShop: number
  /** 同一ショップの連続配置を禁止（デフォルト: true） */
  noConsecutiveShops: boolean
}

/** デフォルトの多様性設定 */
export const DEFAULT_DIVERSITY_OPTIONS: DiversityOptions = {
  maxItemsPerShop: 3,
  noConsecutiveShops: true,
}

// ========================================
// キャッシュ関連の型
// ========================================

/** キャッシュエントリ */
export interface RecommendationCacheEntry {
  userId: string
  items: RecommendedItem[]
  generatedAt: Date
  expiresAt: Date
  version: number
}

/** キャッシュ設定 */
export interface CacheOptions {
  /** TTL（時間単位、デフォルト: 12） */
  ttlHours: number
}

// ========================================
// 人気度メトリクス
// ========================================

/** アイテムの人気度データ */
export interface PopularityMetrics {
  itemId: string
  favoriteCount: number
  keepCount: number
}

