-- =====================================================
-- レコメンドシステム用インデックス作成
--
-- 設計書: Docs/recommendation-system-design.md Section 5.3
--
-- 実行方法: Supabase SQL Editorで実行
-- =====================================================

-- item_favorites テーブル
CREATE INDEX IF NOT EXISTS idx_item_favorites_item_id ON item_favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_user_item ON item_favorites(user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_created_at ON item_favorites(created_at DESC);

-- keep_folder_items テーブル
CREATE INDEX IF NOT EXISTS idx_keep_folder_items_item_id ON keep_folder_items(item_id);
CREATE INDEX IF NOT EXISTS idx_keep_folder_items_folder_id ON keep_folder_items(folder_id, item_id);

-- shop_follows テーブル
CREATE INDEX IF NOT EXISTS idx_shop_follows_shop_id ON shop_follows(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_follows_user_shop ON shop_follows(user_id, shop_id);

-- user_follows テーブル
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id, followee_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followee ON user_follows(followee_id);

-- items テーブル
CREATE INDEX IF NOT EXISTS idx_items_shop_id ON items(shop_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);

-- shops テーブル
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at DESC);

