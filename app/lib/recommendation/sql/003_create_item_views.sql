-- =====================================================
-- 閲覧履歴テーブル作成（将来拡張用）
--
-- 設計書: Docs/recommendation-system-design.md Section 5.1
--
-- 実行方法: Supabase SQL Editorで実行
-- ※ 初期実装では必須ではない。将来的な拡張時に実行
-- =====================================================

-- 閲覧履歴テーブル
CREATE TABLE IF NOT EXISTS item_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT
);

-- パフォーマンス最適化インデックス
CREATE INDEX IF NOT EXISTS idx_item_views_user_id ON item_views(user_id);
CREATE INDEX IF NOT EXISTS idx_item_views_item_id ON item_views(item_id);
CREATE INDEX IF NOT EXISTS idx_item_views_viewed_at ON item_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_item_views_user_item ON item_views(user_id, item_id);

-- RLSポリシー
ALTER TABLE item_views ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の閲覧履歴のみアクセス可能
CREATE POLICY "Users can read own item views"
  ON item_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own item views"
  ON item_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

