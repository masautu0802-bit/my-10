# マイ10（My10）

「なんか欲しいけど、何が欲しいかわからない」というモヤモヤを解消する、キュレーション型Webサービス。

ユーザーは他ユーザーの「セレクトショップ」（最大10個の厳選商品）を閲覧し、価値観や趣味の近い人のおすすめ商品を見つけることができます。

## 技術スタック

- **フロントエンド**: React + Next.js 16.1.6（App Router）
- **認証**: Supabase Auth
- **データベース**: Supabase（PostgreSQL）
- **ホスティング**: Vercel
- **スタイリング**: Tailwind CSS 4

## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd my-10
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Supabaseの設定

#### 3.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスし、新しいプロジェクトを作成
2. プロジェクトの設定から以下の情報を取得：
   - Project URL（`NEXT_PUBLIC_SUPABASE_URL`）
   - Anon/Public Key（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）

#### 3.2 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 3.3 データベーススキーマの作成

Supabaseダッシュボードの SQL Editor で、以下のテーブルを作成します：

- `users`: ユーザー情報
- `shops`: セレクトショップ
- `items`: 商品（最大10個/ショップ）
- `shop_follows`: ショップフォロー関係
- `item_favorites`: 商品お気に入り
- `shop_update_events`: ショップ更新イベント

詳細は `Docs/internai-design.md` を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## プロジェクト構成

```
my-10/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ（ショップ一覧）
│   ├── shops/             # ショップ詳細
│   ├── items/             # 商品詳細
│   ├── my/                # マイページ
│   ├── auth/              # 認証ページ
│   ├── cms/               # 出店者管理ページ
│   ├── actions/           # Server Actions
│   └── lib/               # ユーティリティ・ライブラリ
├── Docs/                  # プロジェクトドキュメント
│   ├── requirement.md     # 要件定義書
│   ├── external-design.md # 外部設計書
│   ├── internai-design.md # 内部設計書
│   └── progress.md        # 進捗管理表
└── public/                # 静的ファイル
```

## ドキュメント

- [要件定義書](./Docs/requirement.md)
- [外部設計書](./Docs/external-design.md)
- [内部設計書](./Docs/internai-design.md)
- [進捗管理表](./Docs/progress.md)

## スクリプト

- `npm run dev`: 開発サーバー起動
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションサーバー起動
- `npm run lint`: ESLint実行

## リリース予定

初期リリース目標：**2026年夏**

## ライセンス

Private
