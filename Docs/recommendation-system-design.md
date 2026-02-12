# Pinterest型レコメンドシステム設計書

## 0. エグゼクティブサマリー

本設計は「マイ10」プロジェクトの既存Supabaseスキーマを前提とした、Pinterest型のレコメンドシステムです。

**設計思想の核心**:
- **2段階構造**: 候補生成 → ランキング
- **協調フィルタリング**: ユーザー行動の共起関係を基にした推薦
- **拡張性重視**: Embedding/Redis/MLモデルを後から追加可能
- **パフォーマンス最優先**: SQL完結、N+1回避、適切なインデックス

---

## 1. 既存スキーマの解析結果

### 1.1 利用可能なテーブル（ユーザー行動）

| テーブル | 主キー | 用途 | 行動シグナル強度 |
|---------|--------|------|-----------------|
| `item_favorites` | (user_id, item_id) | アイテムお気に入り | **強** |
| `keep_folder_items` | (folder_id, item_id) | Keepフォルダ保存 | **強** |
| `keep_folders` | id | ユーザーのフォルダ | - |
| `shop_follows` | (user_id, shop_id) | ショップフォロー | **中** |
| `user_follows` | (follower_id, followee_id) | ユーザーフォロー | **中** |

### 1.2 コンテンツテーブル

| テーブル | 主キー | 説明 |
|---------|--------|------|
| `items` | id | 商品（各ショップが最大10個保持） |
| `shops` | id | セレクトショップ（価値観の集合体） |
| `users` | id | ユーザープロフィール |

### 1.3 現状の課題

**現在記録されていないが必要なデータ**:
- ❌ 閲覧履歴（item views, shop views）
- ❌ クリック履歴（EC URL clicks）
- ❌ 検索履歴
- ❌ セッションデータ

**→ 初期実装では既存の「強いシグナル」のみを活用**

---

## 2. レコメンドアーキテクチャ（2段階構造）

```
┌─────────────────────────────────────────────────────────┐
│                  ユーザーリクエスト                        │
│                 (user_id, context)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           PHASE 1: 候補生成 (Candidate Generation)        │
│                                                          │
│  目的: 数百〜数千のアイテム候補を高速に抽出               │
│  手法: 協調フィルタリング（Item-Item / User-Item）        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Similar      │  │ Collaborative│  │ Shop-Based   │ │
│  │ Users        │  │ Filtering    │  │ Expansion    │ │
│  │ (User-User)  │  │ (Item-Item)  │  │ (Follow)     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                           │                             │
│                    候補アイテムプール                     │
│                    (500〜2000 items)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            PHASE 2: ランキング (Ranking)                 │
│                                                          │
│  目的: 最終的な順位付け（Top 50〜100）                    │
│  手法: 複数シグナルの重み付け合成                         │
│                                                          │
│  ランキング因子:                                          │
│  • 協調フィルタリングスコア (40%)                         │
│  • 人気度スコア (30%)                                    │
│  • 新規性スコア (20%)                                    │
│  • 多様性ペナルティ (10%)                                │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              最終レコメンド結果 (Top 50)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. PHASE 1: 候補生成アルゴリズム

### 3.1 戦略1: Item-Item協調フィルタリング

**思想**: 「このアイテムをお気に入りした人は、他にこれもお気に入りしている」

#### アルゴリズム

```sql
-- Step 1: ユーザーがお気に入り/保存したアイテムを取得
WITH user_liked_items AS (
  SELECT DISTINCT item_id
  FROM (
    -- お気に入り
    SELECT item_id FROM item_favorites WHERE user_id = $1
    UNION
    -- Keep保存
    SELECT kfi.item_id
    FROM keep_folder_items kfi
    JOIN keep_folders kf ON kfi.folder_id = kf.id
    WHERE kf.user_id = $1
  ) AS all_interactions
),

-- Step 2: 類似ユーザー（同じアイテムを好む人）を発見
similar_users AS (
  SELECT
    if2.user_id,
    COUNT(*) AS overlap_count
  FROM user_liked_items uli
  JOIN item_favorites if2 ON uli.item_id = if2.item_id
  WHERE if2.user_id != $1
  GROUP BY if2.user_id
  HAVING COUNT(*) >= 2  -- 最低2つの共通アイテム
  ORDER BY overlap_count DESC
  LIMIT 100  -- Top 100類似ユーザー
),

-- Step 3: 類似ユーザーが好むアイテムを候補として抽出
candidate_items AS (
  SELECT
    if3.item_id,
    COUNT(DISTINCT if3.user_id) AS co_occurrence_score,
    SUM(su.overlap_count) AS weighted_score
  FROM similar_users su
  JOIN item_favorites if3 ON su.user_id = if3.user_id
  WHERE if3.item_id NOT IN (SELECT item_id FROM user_liked_items)  -- 既知アイテムを除外
  GROUP BY if3.item_id
  ORDER BY weighted_score DESC
  LIMIT 500
)

SELECT * FROM candidate_items;
```

**特徴**:
- ✅ **共起カウント**: 同じアイテムセットを好むユーザーの発見
- ✅ **スケーラブル**: PostgreSQLのインデックスで高速化可能
- ✅ **コールドスタート対策**: 最低2つの行動があれば機能

---

### 3.2 戦略2: Shop-Based拡張

**思想**: 「フォローしているショップの他のアイテムや、そのショップをフォローしている人が好むアイテム」

#### アルゴリズム

```sql
-- フォロー中のショップからのレコメンド
WITH followed_shops AS (
  SELECT shop_id FROM shop_follows WHERE user_id = $1
),

-- フォロー中ショップの他のアイテム
shop_items AS (
  SELECT
    i.id AS item_id,
    50.0 AS base_score,  -- ベーススコア
    COUNT(DISTINCT if2.user_id) AS popularity
  FROM followed_shops fs
  JOIN items i ON fs.shop_id = i.shop_id
  LEFT JOIN item_favorites if2 ON i.id = if2.item_id
  WHERE i.id NOT IN (
    SELECT item_id FROM item_favorites WHERE user_id = $1
  )
  GROUP BY i.id
  ORDER BY popularity DESC
  LIMIT 200
)

SELECT * FROM shop_items;
```

---

### 3.3 戦略3: User-Based拡張（フォローユーザー基準）

**思想**: 「フォローしているユーザーが所有するショップのアイテム」

```sql
WITH followed_users AS (
  SELECT followee_id FROM user_follows WHERE follower_id = $1
),

-- フォローユーザーのショップ
followed_user_shops AS (
  SELECT DISTINCT s.id AS shop_id
  FROM followed_users fu
  JOIN shops s ON fu.followee_id = s.owner_id
),

-- それらのショップのアイテム
user_based_items AS (
  SELECT
    i.id AS item_id,
    40.0 AS base_score,
    COUNT(DISTINCT if2.user_id) AS popularity
  FROM followed_user_shops fus
  JOIN items i ON fus.shop_id = i.shop_id
  LEFT JOIN item_favorites if2 ON i.id = if2.item_id
  WHERE i.id NOT IN (
    SELECT item_id FROM item_favorites WHERE user_id = $1
  )
  GROUP BY i.id
  LIMIT 300
)

SELECT * FROM user_based_items;
```

---

### 3.4 統合候補生成クエリ

3つの戦略を統合し、重複排除とスコア合成を行う:

```sql
WITH
  -- [各戦略のCTEをここに配置]

-- 統合と重複排除
unified_candidates AS (
  SELECT item_id, weighted_score AS score, 'item_collab' AS source FROM candidate_items
  UNION ALL
  SELECT item_id, base_score + (popularity * 0.5) AS score, 'shop_based' AS source FROM shop_items
  UNION ALL
  SELECT item_id, base_score + (popularity * 0.3) AS score, 'user_based' AS source FROM user_based_items
),

-- 同一アイテムのスコアを合算
aggregated_candidates AS (
  SELECT
    item_id,
    SUM(score) AS total_score,
    COUNT(DISTINCT source) AS source_diversity,
    ARRAY_AGG(DISTINCT source) AS sources
  FROM unified_candidates
  GROUP BY item_id
)

SELECT
  ac.*,
  i.name,
  i.image_url,
  i.shop_id,
  s.name AS shop_name
FROM aggregated_candidates ac
JOIN items i ON ac.item_id = i.id
JOIN shops s ON i.shop_id = s.id
ORDER BY
  total_score DESC,
  source_diversity DESC  -- 多様なソースからのアイテムを優先
LIMIT 1000;
```

---

## 4. PHASE 2: ランキングアルゴリズム

候補生成で得た1000件のアイテムを最終的に順位付けします。

### 4.1 ランキング因子

#### 因子1: 協調フィルタリングスコア (40%)

Phase 1で計算した`total_score`を正規化:

```sql
-- スコアを0〜1に正規化
normalized_cf_score = (total_score - MIN(total_score)) / (MAX(total_score) - MIN(total_score))
```

#### 因子2: 人気度スコア (30%)

全体でのお気に入り数とKeep保存数:

```sql
WITH popularity_metrics AS (
  SELECT
    item_id,
    COUNT(DISTINCT user_id) AS favorite_count,
    (
      SELECT COUNT(*)
      FROM keep_folder_items kfi
      WHERE kfi.item_id = if2.item_id
    ) AS keep_count
  FROM item_favorites if2
  GROUP BY item_id
)

SELECT
  item_id,
  LOG(1 + favorite_count * 2 + keep_count * 3) AS popularity_score
  -- Keep保存はお気に入りより強いシグナルとして重み付け
FROM popularity_metrics;
```

#### 因子3: 新規性スコア (20%)

最近追加されたアイテムにボーナス:

```sql
SELECT
  id AS item_id,
  CASE
    WHEN created_at > NOW() - INTERVAL '7 days' THEN 1.0
    WHEN created_at > NOW() - INTERVAL '30 days' THEN 0.7
    WHEN created_at > NOW() - INTERVAL '90 days' THEN 0.4
    ELSE 0.1
  END AS freshness_score
FROM items;
```

#### 因子4: 多様性ペナルティ (10%)

同じショップのアイテムが連続しないように:

```sql
-- 実装はアプリケーション層で行う（後述）
-- 同一ショップから最大3アイテムまで、連続配置を避ける
```

### 4.2 最終スコア計算

```sql
WITH
  candidates AS (/* Phase 1の結果 */),
  normalized_scores AS (
    SELECT
      c.item_id,
      -- 協調フィルタリングスコア (40%)
      (c.total_score - MIN(c.total_score) OVER ()) /
      NULLIF((MAX(c.total_score) OVER () - MIN(c.total_score) OVER ()), 0) * 0.4 AS cf_component,

      -- 人気度スコア (30%)
      LOG(1 + COALESCE(pm.favorite_count, 0) * 2 + COALESCE(pm.keep_count, 0) * 3) / 10.0 * 0.3 AS popularity_component,

      -- 新規性スコア (20%)
      CASE
        WHEN i.created_at > NOW() - INTERVAL '7 days' THEN 0.20
        WHEN i.created_at > NOW() - INTERVAL '30 days' THEN 0.14
        WHEN i.created_at > NOW() - INTERVAL '90 days' THEN 0.08
        ELSE 0.02
      END AS freshness_component,

      c.source_diversity,
      i.shop_id,
      i.*
    FROM candidates c
    JOIN items i ON c.item_id = i.id
    LEFT JOIN (
      SELECT
        item_id,
        COUNT(DISTINCT user_id) AS favorite_count,
        (SELECT COUNT(*) FROM keep_folder_items kfi WHERE kfi.item_id = if2.item_id) AS keep_count
      FROM item_favorites if2
      GROUP BY item_id
    ) pm ON c.item_id = pm.item_id
  )

SELECT
  item_id,
  cf_component + popularity_component + freshness_component AS final_score,
  cf_component,
  popularity_component,
  freshness_component,
  shop_id,
  name,
  image_url
FROM normalized_scores
ORDER BY final_score DESC
LIMIT 100;
```

---

## 5. 必要なデータベース追加要素

### 5.1 新規テーブル: `item_views`（閲覧履歴）

今後の改善のため、閲覧履歴を記録:

```sql
CREATE TABLE item_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,  -- セッション識別用（将来的に）

  -- インデックス
  CONSTRAINT item_views_unique UNIQUE (user_id, item_id, viewed_at)
);

-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_item_views_user_id ON item_views(user_id);
CREATE INDEX idx_item_views_item_id ON item_views(item_id);
CREATE INDEX idx_item_views_viewed_at ON item_views(viewed_at DESC);
CREATE INDEX idx_item_views_user_item ON item_views(user_id, item_id);
```

**用途**:
- 閲覧履歴ベースのレコメンド（弱いシグナル）
- セッション解析
- A/Bテスト効果測定

---

### 5.2 新規テーブル: `recommendation_cache`（レコメンド結果キャッシュ）

計算コストの高いレコメンドをキャッシュ:

```sql
CREATE TABLE recommendation_cache (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  recommended_item_ids UUID[] NOT NULL,  -- 順序付きアイテムID配列
  scores JSONB,  -- 各アイテムのスコア詳細
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  version INTEGER NOT NULL DEFAULT 1  -- アルゴリズムバージョン
);

CREATE INDEX idx_recommendation_cache_expires ON recommendation_cache(expires_at);
```

**キャッシュ戦略**:
- TTL: 6時間〜24時間
- ユーザーが新規アクション（お気に入り、フォロー）を行ったら無効化
- バッチ更新: 深夜に全ユーザーのキャッシュを再生成

---

### 5.3 既存テーブルへのインデックス追加

**重要**: 以下のインデックスがパフォーマンスに必須:

```sql
-- item_favorites
CREATE INDEX IF NOT EXISTS idx_item_favorites_item_id ON item_favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_user_item ON item_favorites(user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_created_at ON item_favorites(created_at DESC);

-- keep_folder_items
CREATE INDEX IF NOT EXISTS idx_keep_folder_items_item_id ON keep_folder_items(item_id);
CREATE INDEX IF NOT EXISTS idx_keep_folder_items_folder_id ON keep_folder_items(folder_id, item_id);

-- shop_follows
CREATE INDEX IF NOT EXISTS idx_shop_follows_shop_id ON shop_follows(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_follows_user_shop ON shop_follows(user_id, shop_id);

-- user_follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id, followee_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followee ON user_follows(followee_id);

-- items
CREATE INDEX IF NOT EXISTS idx_items_shop_id ON items(shop_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- shops
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at DESC);
```

---

## 6. 実装アーキテクチャ

### 6.1 ファイル構成

```
app/
├── lib/
│   └── recommendation/
│       ├── candidate-generation.ts    # Phase 1: 候補生成
│       ├── ranking.ts                 # Phase 2: ランキング
│       ├── scoring.ts                 # スコア計算ユーティリティ
│       ├── diversity.ts               # 多様性制御
│       ├── cache.ts                   # キャッシュ管理
│       └── types.ts                   # 型定義
├── actions/
│   └── recommendation.ts              # Server Actions
└── api/
    └── recommendations/
        └── route.ts                   # API Route（バッチ処理用）
```

### 6.2 コア関数設計

#### `generateRecommendations(userId: string, options?: RecommendationOptions): Promise<RecommendedItem[]>`

```typescript
// app/lib/recommendation/candidate-generation.ts

export interface RecommendationOptions {
  limit?: number;              // 返却数（デフォルト: 50）
  excludeItemIds?: string[];   // 除外アイテムID
  useCache?: boolean;          // キャッシュ使用（デフォルト: true）
  minScore?: number;           // 最小スコア閾値
}

export interface RecommendedItem {
  itemId: string;
  name: string;
  imageUrl: string | null;
  shopId: string;
  shopName: string;
  finalScore: number;
  scoreBreakdown: {
    collaborativeFiltering: number;
    popularity: number;
    freshness: number;
  };
  sources: ('item_collab' | 'shop_based' | 'user_based')[];
}

export async function generateRecommendations(
  userId: string,
  options: RecommendationOptions = {}
): Promise<RecommendedItem[]> {
  const {
    limit = 50,
    excludeItemIds = [],
    useCache = true,
    minScore = 0,
  } = options;

  // 1. キャッシュチェック
  if (useCache) {
    const cached = await getCachedRecommendations(userId);
    if (cached && cached.expiresAt > new Date()) {
      return cached.items.slice(0, limit);
    }
  }

  // 2. Phase 1: 候補生成
  const candidates = await generateCandidates(userId, {
    excludeItemIds,
    candidateLimit: 1000,
  });

  // 3. Phase 2: ランキング
  const ranked = await rankCandidates(userId, candidates);

  // 4. 多様性制御
  const diversified = applyDiversityConstraints(ranked, {
    maxItemsPerShop: 3,
    noConsecutiveShops: true,
  });

  // 5. キャッシュ保存
  await cacheRecommendations(userId, diversified, {
    ttlHours: 12,
  });

  // 6. 結果返却
  return diversified
    .filter(item => item.finalScore >= minScore)
    .slice(0, limit);
}
```

---

#### `generateCandidates(userId: string, options): Promise<CandidateItem[]>`

```typescript
// app/lib/recommendation/candidate-generation.ts

interface CandidateItem {
  itemId: string;
  totalScore: number;
  sourceDiversity: number;
  sources: string[];
  // メタデータ
  name: string;
  imageUrl: string | null;
  shopId: string;
  shopName: string;
}

async function generateCandidates(
  userId: string,
  options: { excludeItemIds: string[]; candidateLimit: number }
): Promise<CandidateItem[]> {
  const supabase = await createClient();

  // 統合候補生成クエリを実行
  const { data, error } = await supabase.rpc('generate_candidate_items', {
    p_user_id: userId,
    p_exclude_item_ids: options.excludeItemIds,
    p_limit: options.candidateLimit,
  });

  if (error) throw error;

  return data as CandidateItem[];
}
```

---

#### `rankCandidates(userId: string, candidates: CandidateItem[]): Promise<RecommendedItem[]>`

```typescript
// app/lib/recommendation/ranking.ts

import { calculatePopularityScore, calculateFreshnessScore } from './scoring';

export async function rankCandidates(
  userId: string,
  candidates: CandidateItem[]
): Promise<RecommendedItem[]> {
  const supabase = await createClient();

  // 人気度データを一括取得（N+1回避）
  const itemIds = candidates.map(c => c.itemId);
  const popularityMap = await getPopularityScores(itemIds);
  const freshnessMap = await getFreshnessScores(itemIds);

  // スコア正規化
  const scores = candidates.map(c => c.totalScore);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1;

  // 最終スコア計算
  const rankedItems = candidates.map(candidate => {
    // 協調フィルタリングスコア (40%)
    const cfScore = ((candidate.totalScore - minScore) / scoreRange) * 0.4;

    // 人気度スコア (30%)
    const popularityScore = (popularityMap.get(candidate.itemId) || 0) * 0.3;

    // 新規性スコア (20%)
    const freshnessScore = (freshnessMap.get(candidate.itemId) || 0) * 0.2;

    const finalScore = cfScore + popularityScore + freshnessScore;

    return {
      itemId: candidate.itemId,
      name: candidate.name,
      imageUrl: candidate.imageUrl,
      shopId: candidate.shopId,
      shopName: candidate.shopName,
      finalScore,
      scoreBreakdown: {
        collaborativeFiltering: cfScore,
        popularity: popularityScore,
        freshness: freshnessScore,
      },
      sources: candidate.sources,
    } as RecommendedItem;
  });

  // スコア降順でソート
  return rankedItems.sort((a, b) => b.finalScore - a.finalScore);
}
```

---

#### `applyDiversityConstraints(items: RecommendedItem[], options): RecommendedItem[]`

```typescript
// app/lib/recommendation/diversity.ts

interface DiversityOptions {
  maxItemsPerShop: number;
  noConsecutiveShops: boolean;
}

export function applyDiversityConstraints(
  items: RecommendedItem[],
  options: DiversityOptions
): RecommendedItem[] {
  const { maxItemsPerShop, noConsecutiveShops } = options;

  const result: RecommendedItem[] = [];
  const shopItemCount = new Map<string, number>();
  let lastShopId: string | null = null;

  for (const item of items) {
    const currentCount = shopItemCount.get(item.shopId) || 0;

    // 同一ショップの最大数チェック
    if (currentCount >= maxItemsPerShop) {
      continue;
    }

    // 連続配置チェック
    if (noConsecutiveShops && lastShopId === item.shopId) {
      // 一旦スキップして後で挿入を試みる
      continue;
    }

    result.push(item);
    shopItemCount.set(item.shopId, currentCount + 1);
    lastShopId = item.shopId;
  }

  return result;
}
```

---

## 7. PostgreSQL関数（候補生成の最適化）

パフォーマンスのため、候補生成をPostgreSQL関数として実装:

```sql
-- app/lib/recommendation/sql/generate_candidate_items.sql

CREATE OR REPLACE FUNCTION generate_candidate_items(
  p_user_id UUID,
  p_exclude_item_ids UUID[] DEFAULT ARRAY[]::UUID[],
  p_limit INTEGER DEFAULT 1000
)
RETURNS TABLE (
  item_id UUID,
  total_score NUMERIC,
  source_diversity INTEGER,
  sources TEXT[],
  name TEXT,
  image_url TEXT,
  shop_id UUID,
  shop_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH
    -- ユーザーの既知アイテム
    user_liked_items AS (
      SELECT DISTINCT item_id
      FROM (
        SELECT item_id FROM item_favorites WHERE user_id = p_user_id
        UNION
        SELECT kfi.item_id
        FROM keep_folder_items kfi
        JOIN keep_folders kf ON kfi.folder_id = kf.id
        WHERE kf.user_id = p_user_id
      ) AS all_interactions
    ),

    -- 類似ユーザー（Item-Item協調フィルタリング）
    similar_users AS (
      SELECT
        if2.user_id,
        COUNT(*) AS overlap_count
      FROM user_liked_items uli
      JOIN item_favorites if2 ON uli.item_id = if2.item_id
      WHERE if2.user_id != p_user_id
      GROUP BY if2.user_id
      HAVING COUNT(*) >= 2
      ORDER BY overlap_count DESC
      LIMIT 100
    ),

    -- Item-Item候補
    item_collab_candidates AS (
      SELECT
        if3.item_id,
        COUNT(DISTINCT if3.user_id)::NUMERIC AS co_occurrence_score,
        SUM(su.overlap_count)::NUMERIC AS weighted_score,
        'item_collab'::TEXT AS source
      FROM similar_users su
      JOIN item_favorites if3 ON su.user_id = if3.user_id
      WHERE if3.item_id NOT IN (SELECT item_id FROM user_liked_items)
        AND if3.item_id != ALL(p_exclude_item_ids)
      GROUP BY if3.item_id
      ORDER BY weighted_score DESC
      LIMIT 500
    ),

    -- Shop-Based候補
    followed_shops AS (
      SELECT shop_id FROM shop_follows WHERE user_id = p_user_id
    ),
    shop_based_candidates AS (
      SELECT
        i.id AS item_id,
        (50.0 + LOG(1 + COUNT(DISTINCT if2.user_id)) * 5)::NUMERIC AS weighted_score,
        'shop_based'::TEXT AS source
      FROM followed_shops fs
      JOIN items i ON fs.shop_id = i.shop_id
      LEFT JOIN item_favorites if2 ON i.id = if2.item_id
      WHERE i.id NOT IN (SELECT item_id FROM user_liked_items)
        AND i.id != ALL(p_exclude_item_ids)
      GROUP BY i.id
      LIMIT 300
    ),

    -- User-Based候補
    followed_users AS (
      SELECT followee_id FROM user_follows WHERE follower_id = p_user_id
    ),
    user_based_candidates AS (
      SELECT
        i.id AS item_id,
        (40.0 + LOG(1 + COUNT(DISTINCT if2.user_id)) * 3)::NUMERIC AS weighted_score,
        'user_based'::TEXT AS source
      FROM followed_users fu
      JOIN shops s ON fu.followee_id = s.owner_id
      JOIN items i ON s.id = i.shop_id
      LEFT JOIN item_favorites if2 ON i.id = if2.item_id
      WHERE i.id NOT IN (SELECT item_id FROM user_liked_items)
        AND i.id != ALL(p_exclude_item_ids)
      GROUP BY i.id
      LIMIT 300
    ),

    -- 統合
    unified_candidates AS (
      SELECT item_id, weighted_score, source FROM item_collab_candidates
      UNION ALL
      SELECT item_id, weighted_score, source FROM shop_based_candidates
      UNION ALL
      SELECT item_id, weighted_score, source FROM user_based_candidates
    ),

    -- 集約
    aggregated_candidates AS (
      SELECT
        uc.item_id,
        SUM(uc.weighted_score)::NUMERIC AS total_score,
        COUNT(DISTINCT uc.source)::INTEGER AS source_diversity,
        ARRAY_AGG(DISTINCT uc.source) AS sources
      FROM unified_candidates uc
      GROUP BY uc.item_id
    )

  -- 最終結果
  SELECT
    ac.item_id,
    ac.total_score,
    ac.source_diversity,
    ac.sources,
    i.name,
    i.image_url,
    i.shop_id,
    s.name AS shop_name
  FROM aggregated_candidates ac
  JOIN items i ON ac.item_id = i.id
  JOIN shops s ON i.shop_id = s.id
  ORDER BY
    ac.total_score DESC,
    ac.source_diversity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

---

## 8. コールドスタート対策

### 8.1 新規ユーザー（行動履歴なし）

**問題**: お気に入りもフォローも0の状態

**対策**:
1. **人気アイテムベースライン**: 全体で最も人気のアイテム
2. **新着アイテム**: 最近追加されたアイテム
3. **タグベース**: ユーザープロフィールのタグ情報（将来的に追加）

```sql
-- 新規ユーザー向けレコメンド
CREATE OR REPLACE FUNCTION get_cold_start_recommendations(
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  item_id UUID,
  name TEXT,
  image_url TEXT,
  shop_id UUID,
  shop_name TEXT,
  popularity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH popularity_metrics AS (
    SELECT
      i.id,
      i.name,
      i.image_url,
      i.shop_id,
      s.name AS shop_name,
      (
        COUNT(DISTINCT if2.user_id) * 2 +
        COUNT(DISTINCT kfi.folder_id) * 3
      )::NUMERIC AS popularity_score
    FROM items i
    JOIN shops s ON i.shop_id = s.id
    LEFT JOIN item_favorites if2 ON i.id = if2.item_id
    LEFT JOIN keep_folder_items kfi ON i.id = kfi.item_id
    WHERE i.created_at > NOW() - INTERVAL '90 days'  -- 90日以内
    GROUP BY i.id, i.name, i.image_url, i.shop_id, s.name
  )
  SELECT * FROM popularity_metrics
  ORDER BY popularity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 8.2 新規アイテム（インタラクションなし）

**対策**:
- 新規ペナルティを避けるため、`freshness_score`で自動的にブースト
- 所属ショップのフォロワーには優先的に表示

---

## 9. パフォーマンス最適化戦略

### 9.1 実行時間目標

| 処理 | 目標 | 許容 |
|------|------|------|
| キャッシュヒット | < 50ms | 100ms |
| キャッシュミス（計算） | < 500ms | 1000ms |
| バッチ更新（1ユーザー） | < 2s | 5s |

### 9.2 最適化手法

1. **インデックス最適化** (前述)
2. **クエリプラン分析**:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM generate_candidate_items('user-uuid-here');
   ```
3. **パーティショニング** (将来的):
   - `item_views`テーブルを月次でパーティション化
4. **マテリアライズドビュー** (将来的):
   ```sql
   CREATE MATERIALIZED VIEW item_popularity_summary AS
   SELECT
     item_id,
     COUNT(DISTINCT user_id) AS favorite_count,
     MAX(created_at) AS last_favorited_at
   FROM item_favorites
   GROUP BY item_id;

   CREATE UNIQUE INDEX ON item_popularity_summary(item_id);
   REFRESH MATERIALIZED VIEW CONCURRENTLY item_popularity_summary;
   ```

### 9.3 キャッシュ戦略

- **L1キャッシュ**: Next.js Server Component Cache (15分)
- **L2キャッシュ**: PostgreSQL `recommendation_cache`テーブル (12時間)
- **L3キャッシュ** (将来): Redis (5分、高頻度ユーザー用)

---

## 10. 将来の拡張ロードマップ

### Phase 2: コンテンツベースフィルタリング

**追加要素**:
- アイテム/ショップの特徴量抽出（タグ、カテゴリ、テキストembedding）
- TF-IDFやBM25によるテキスト類似度

**実装**:
```sql
-- embeddings列をitemsテーブルに追加
ALTER TABLE items ADD COLUMN embedding VECTOR(768);  -- pgvector拡張

-- ベクトル検索インデックス
CREATE INDEX ON items USING ivfflat (embedding vector_cosine_ops);

-- 類似アイテム検索
SELECT id, name, 1 - (embedding <=> $1) AS similarity
FROM items
WHERE 1 - (embedding <=> $1) > 0.7
ORDER BY embedding <=> $1
LIMIT 100;
```

### Phase 3: リアルタイムパーソナライゼーション

- **セッション内行動**: 閲覧・スクロール深度・hover時間
- **A/Bテスト**: 複数ランキングアルゴリズムの比較
- **CTR予測**: 機械学習モデルでクリック率を予測

### Phase 4: ソーシャルシグナル強化

- **コメント/レビュー**: テキストセンチメント分析
- **シェア**: 外部共有の追跡
- **タイムライン**: フォロー中のユーザーの最新行動

---

## 11. 監視・評価指標

### 11.1 システムメトリクス

| 指標 | 計測方法 | 目標 |
|------|----------|------|
| レコメンド応答時間 | サーバーログ | < 500ms (p95) |
| キャッシュヒット率 | `recommendation_cache`使用率 | > 80% |
| 候補生成エラー率 | エラーログ | < 0.1% |

### 11.2 ビジネスメトリクス

| 指標 | 計測方法 | 目標 |
|------|----------|------|
| CTR (Click-Through Rate) | クリック数 / 表示数 | > 5% |
| コンバージョン率 | お気に入り数 / クリック数 | > 10% |
| セレンディピティ | 新規ショップ発見率 | > 30% |
| セッション時間増加 | Google Analytics | +20% |

### 11.3 品質メトリクス

- **Precision@K**: 上位K件の適合率
- **Recall@K**: 上位K件の再現率
- **NDCG** (Normalized Discounted Cumulative Gain): ランキング品質
- **Diversity**: 推薦結果の多様性（ショップ数/アイテム数）

---

## 12. 実装チェックリスト

### 必須（MVP）

- [ ] `item_views`テーブル作成
- [ ] `recommendation_cache`テーブル作成
- [ ] 既存テーブルへのインデックス追加
- [ ] `generate_candidate_items()` PostgreSQL関数実装
- [ ] `generateRecommendations()` TypeScript関数実装
- [ ] `rankCandidates()` 実装
- [ ] `applyDiversityConstraints()` 実装
- [ ] コールドスタート対策実装
- [ ] キャッシュ機構実装
- [ ] トップページへのレコメンド表示

### 推奨（Phase 1.5）

- [ ] 閲覧履歴トラッキング実装
- [ ] バッチ更新スクリプト（cron/Vercel Cron）
- [ ] パフォーマンスモニタリング（Sentry/DataDog）
- [ ] A/Bテストフレームワーク準備

### 将来的

- [ ] pgvector導入（埋め込みベクトル検索）
- [ ] Redis導入（高速キャッシュ）
- [ ] 機械学習モデル（CTR予測）
- [ ] リアルタイムストリーム処理

---

## 13. 設計思想のまとめ

### 13.1 核心原則

1. **データ駆動**: 既存のユーザー行動データ（お気に入り、Keep、フォロー）を最大活用
2. **2段階構造**: 高速な候補生成 + 精密なランキング
3. **協調フィルタリング**: 「似たユーザーは似たアイテムを好む」という原則
4. **拡張性**: Embedding、Redis、MLモデルを後から組み込める設計
5. **パフォーマンス**: PostgreSQL最適化、キャッシュ、N+1回避

### 13.2 Pinterest型の特徴

- **視覚的発見**: 画像中心のUIで"serendipity"を重視
- **エンドレススクロール**: 無限レコメンド対応可能
- **パーソナライゼーション**: 個々のユーザー行動に基づく推薦
- **ソーシャルシグナル**: フォロー関係を重視

### 13.3 本設計の強み

- ✅ 既存スキーマに最適化（追加テーブル最小限）
- ✅ SQL完結で高速（PostgreSQLの力を最大活用）
- ✅ コールドスタート対策済み
- ✅ 段階的な拡張が可能
- ✅ 説明可能性（スコアの内訳を追跡可能）

---

**次のステップ**: このドキュメントを基に、実装タスクをブレークダウンして進めていきましょう。

