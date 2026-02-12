-- =====================================================
-- レコメンドキャッシュテーブル作成
--
-- 設計書: Docs/recommendation-system-design.md Section 5.2
--
-- 実行方法: Supabase SQL Editorで実行
-- =====================================================

-- レコメンド結果キャッシュテーブル
CREATE TABLE IF NOT EXISTS recommendation_cache (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  recommended_item_ids UUID[] NOT NULL,
  scores JSONB,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

-- 期限切れチェック用インデックス
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_expires
  ON recommendation_cache(expires_at);

-- RLSポリシー
ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のキャッシュのみアクセス可能
CREATE POLICY "Users can read own recommendation cache"
  ON recommendation_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendation cache"
  ON recommendation_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendation cache"
  ON recommendation_cache FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendation cache"
  ON recommendation_cache FOR DELETE
  USING (auth.uid() = user_id);

