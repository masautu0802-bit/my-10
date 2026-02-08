# マイ10 内部設計書（Internal Design Document）

## 1. 設計方針

### 1.1 中心ドメイン

* 中心ドメイン：**ショップ（Shop）**
* ショップは「価値観の集合体」であり、本サービスの最小かつ最重要単位

### 1.2 設計上の最優先事項

* **データ構造の安定性を最優先**
* UIや表示順、レコメンドは後から変更可能な前提で疎結合に設計

### 1.3 将来拡張前提

* 企業・公式ショップなどのBtoC拡張可能性を残す
* ユーザーとショップは1対多構造

---

## 2. 認証・ユーザー設計

### 2.1 認証方式

* 認証基盤：**Supabase Auth**
* MVP段階：メール＋パスワード認証のみ
* ソーシャルログイン（Google, GitHub等）は将来拡張

### 2.2 ユーザーモデル方針

* Supabase AuthのユーザーID（UUID）をそのまま内部ユーザーIDとして利用
* 未ログインユーザーの行動ログは取得しない
* Supabase Authの`auth.users`テーブルと、アプリケーション独自の`public.users`テーブルを連携

---

## 3. データモデル設計（論理）

### 3.1 エンティティ一覧

* User
* Shop
* Item
* ShopFollow
* UserFollow（将来用）
* ItemFavorite
* ShopUpdateEvent

---

### 3.2 エンティティ関係

* User 1 --- N Shop
* Shop 1 --- N Item
* User N --- N Shop（Follow）
* User N --- N User（Follow, 将来用）
* User N --- N Item（Favorite）

---

## 4. テーブル設計（Supabase / PostgreSQL）

### 4.1 users

| カラム名       | 型            | 備考                      |
| ---------- | ------------ | ----------------------- |
| id         | uuid (PK)    | Supabase Auth user id   |
| name       | text         | 表示名                     |
| created_at | timestamptz  | デフォルト: now()            |
| updated_at | timestamptz  | デフォルト: now()            |

※ Supabase Authの`auth.users`とリレーションを持つ

---

### 4.2 shops

| カラム名        | 型           | 備考                   |
| ----------- | ----------- | -------------------- |
| id          | uuid (PK)   | デフォルト: gen_random_uuid() |
| owner_id    | uuid (FK)   | users.id             |
| name        | text        |                      |
| theme       | text        | ショップテーマ              |
| description | text        | 任意                   |
| created_at  | timestamptz | デフォルト: now()          |
| updated_at  | timestamptz | デフォルト: now()          |

---

### 4.3 items

| カラム名        | 型           | 備考                   |
| ----------- | ----------- | -------------------- |
| id          | uuid (PK)   | デフォルト: gen_random_uuid() |
| shop_id     | uuid (FK)   | shops.id             |
| name        | text        |                      |
| image_url   | text        |                      |
| comment     | text        | オーナーコメント             |
| price_range | text        |                      |
| ec_url      | text        | 外部EC                 |
| order_index | integer     | 表示順                  |
| created_at  | timestamptz | デフォルト: now()          |
| updated_at  | timestamptz | デフォルト: now()          |

---

### 4.4 shop_follows

| カラム名       | 型           | 備考           |
| ---------- | ----------- | ------------ |
| user_id    | uuid (FK)   | users.id     |
| shop_id    | uuid (FK)   | shops.id     |
| created_at | timestamptz | デフォルト: now() |

複合PK（user_id, shop_id）

---

### 4.5 user_follows（将来用）

| カラム名        | 型           | 備考           |
| ----------- | ----------- | ------------ |
| follower_id | uuid        | users.id     |
| followee_id | uuid        | users.id     |
| created_at  | timestamptz | デフォルト: now() |

複合PK（follower_id, followee_id）

---

### 4.6 item_favorites

| カラム名       | 型           | 備考           |
| ---------- | ----------- | ------------ |
| user_id    | uuid        | users.id     |
| item_id    | uuid        | items.id     |
| created_at | timestamptz | デフォルト: now() |

複合PK（user_id, item_id）

---

### 4.7 shop_update_events

| カラム名       | 型           | 備考                                       |
| ---------- | ----------- | ---------------------------------------- |
| id         | uuid (PK)   | デフォルト: gen_random_uuid()                |
| shop_id    | uuid (FK)   | shops.id                                 |
| type       | text        | item_added / item_updated / item_removed |
| created_at | timestamptz | デフォルト: now()                            |

※ 並び順変更のみのイベントは記録しない

---

## 5. Row Level Security（RLS）ポリシー設計

Supabaseの強力なセキュリティ機能であるRLSを活用し、データアクセスを制御します。

### 5.1 users テーブル

* **SELECT**: 全ユーザーが全レコードを参照可能（公開情報のため）
* **INSERT**: 認証済みユーザーが自分のレコードのみ作成可能
* **UPDATE**: 認証済みユーザーが自分のレコードのみ更新可能
* **DELETE**: 認証済みユーザーが自分のレコードのみ削除可能

### 5.2 shops テーブル

* **SELECT**: 全ユーザーが全レコードを参照可能（公開情報のため）
* **INSERT**: 認証済みユーザーが自分のショップのみ作成可能
* **UPDATE**: ショップオーナー（owner_id）のみ更新可能
* **DELETE**: ショップオーナー（owner_id）のみ削除可能

### 5.3 items テーブル

* **SELECT**: 全ユーザーが全レコードを参照可能（公開情報のため）
* **INSERT**: ショップオーナーのみ作成可能
* **UPDATE**: ショップオーナーのみ更新可能
* **DELETE**: ショップオーナーのみ削除可能

### 5.4 shop_follows テーブル

* **SELECT**: 認証済みユーザーが自分のフォロー情報のみ参照可能
* **INSERT**: 認証済みユーザーが自分のフォロー情報のみ作成可能
* **DELETE**: 認証済みユーザーが自分のフォロー情報のみ削除可能

### 5.5 item_favorites テーブル

* **SELECT**: 認証済みユーザーが自分のお気に入り情報のみ参照可能
* **INSERT**: 認証済みユーザーが自分のお気に入り情報のみ作成可能
* **DELETE**: 認証済みユーザーが自分のお気に入り情報のみ削除可能

### 5.6 shop_update_events テーブル

* **SELECT**: 全ユーザーが全レコードを参照可能
* **INSERT**: ショップオーナーのみ作成可能（トリガーで自動作成も検討）

---

## 6. 更新通知設計

* フォロー中ショップに `shop_update_events` が存在する場合

  * マイページに「新着バッジ」を表示
* リアルタイム通知・Push通知は非対応（MVP）

---

## 7. Next.js アーキテクチャ

### 6.1 基本方針

* App Router 使用
* Server Components / Server Actions 中心
* Client Components は最小限

### 6.2 想定ディレクトリ構成

```
app/
 ├─ page.tsx            // トップ
 ├─ shops/
 │   └─ [shopId]/page.tsx
 ├─ items/
 │   └─ [itemId]/page.tsx
 ├─ my/page.tsx          // マイページ
 ├─ auth/
 ├─ cms/
 │   └─ shops/
 │       └─ [shopId]/
 ├─ actions/
 └─ lib/
```

---

## 8. データ取得・更新方針

* **Supabase Client** を使用してデータアクセス
* 読み取り：Server ComponentsでSupabase Serverクライアントを使用
* 書き込み：Server Actionsでトランザクション処理
* Row Level Security（RLS）を活用してセキュリティを確保
* API Routesは必要に応じて使用（判断は実装時）

### 7.1 Supabase クライアント構成

* Server Components: `@supabase/ssr` の `createServerClient`
* Server Actions: `@supabase/ssr` の `createServerClient`
* Client Components: `@supabase/supabase-js` の `createClient`
* 認証状態管理: `@supabase/auth-helpers-nextjs`

---

## 9. Claude Code / Cursor 運用ルール

### 8.1 Claude Code

* 実装の大半を担当
* ページ単位・機能単位のコード生成
* 型定義・CRUD処理の作成

### 8.2 Cursor

* 微調整・リファクタリング
* バグ修正
* UI・UXの細かな改善

---

## 10. 内部設計書の位置づけ

本書は、

* Claude Codeへの実装指示
* Cursorでのコードレビュー・修正
* 将来のレコメンド設計・拡張

の**技術的な共通基盤**として使用する。
