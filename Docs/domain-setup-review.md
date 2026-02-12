# ドメイン設定の確認結果（my-10.com）

ドメイン取得後の設定について確認した結果です。修正を推奨する点と、そのままで問題ない点を整理しています。

---

## 要対応（修正を推奨）

### 1. Supabase：Redirect URLs が未設定

**現状**  
- Site URL は `https://my-10.com` で設定済み  
- **Redirect URLs が「No Redirect URLs」のまま**

**問題**  
認証（Google OAuth など）後に、Supabase がアプリ側の `/auth/callback` へリダイレクトする際、許可リストにない URL だとブロックされる場合があります。  
現在の実装では `redirectTo: ${origin}/auth/callback` により、本番では次の URL にリダイレクトされます。

- `https://my-10.com/auth/callback`
- `https://www.my-10.com/auth/callback`（www でアクセスした場合）

**対応**  
Supabase の **Authentication → URL Configuration → Redirect URLs** で次を追加してください。

- `https://my-10.com/auth/callback`
- `https://www.my-10.com/auth/callback`

ワイルドカードを使う場合は、例として以下も有効です。

- `https://my-10.com/**`
- `https://www.my-10.com/**`

---

### 2. お名前.com DNS：ルートドメインの A レコードの IP

**現状**  
- ホスト名 `@`（ルートドメイン my-10.com）の A レコードが **216.198.79.1**

**問題**  
Vercel の公式ドキュメントでは、ルートドメイン用の A レコードは **76.76.21.21** を指定するよう案内されています。  
216.198.79.1 は Vercel の標準的なルート用 IP ではないため、`my-10.com` が意図したとおり Vercel のアプリに届いていない可能性があります。

**確認方法**  
ターミナルで次を実行し、返る IP を確認してください。

```bash
dig my-10.com +short
```

**対応**  
- 返る IP が 216.198.79.1 のままの場合  
  - お名前.com の DNS で、ルートドメイン（`@`）の A レコードの値を **76.76.21.21** に変更してください。  
- 既に 76.76.21.21 になっている、または Vercel のドメイン設定画面で別の IP を案内されている場合は、その指示に従ってください。

**補足**  
- `www.my-10.com` の CNAME（`5e14e9eb29331d07.vercel-dns-017.`）は Vercel 向けで問題ありません。  
- 変更後、DNS の反映には最大 24〜48 時間かかることがあります。

---

### 3. Google Cloud Console：承認済みの JavaScript 生成元が空

**現状**  
- **承認済みの JavaScript 生成元** に何も登録されていない  
- 承認済みのリダイレクト URI には、Supabase コールバック・`https://my-10.com/auth/callback`・localhost などが登録済み

**問題**  
OAuth 2.0 の仕様上、リクエストが送られる「オリジン」を JavaScript 生成元として登録しておく必要があります。  
本番で `https://my-10.com` や `https://www.my-10.com` からサインインする場合、ここが空だとエラーやブロックになる可能性があります。

**対応**  
**承認済みの JavaScript 生成元** に次を追加してください。

- `https://my-10.com`
- `https://www.my-10.com`

開発用に localhost も使う場合は、以下も追加してください。

- `http://localhost:3000`

---

## 軽微な確認（任意）

### 4. Site URL の末尾スラッシュの統一

**現状**  
- Supabase の Site URL: `https://my-10.com`（末尾なし）  
- Vercel の `NEXT_PUBLIC_SITE_URL`: `https://my-10.com/`（末尾あり）

**推奨**  
どちらかに揃えると、メール内リンクやリダイレクトの挙動が予測しやすくなります。  
多くの場合「末尾なし」で統一することが多いです。

- 必要なら、Vercel の環境変数を `https://my-10.com`（末尾なし）に変更してください。  
- アプリ内で `NEXT_PUBLIC_SITE_URL` を URL 結合に使っている場合は、コード側で `replace(/\/$/, '')` などで末尾スラッシュを除去しても構いません。

---

## 問題なさそうな設定

- **Vercel Domains**  
  - `my-10.com` / `www.my-10.com` / `my-10-qffh.vercel.app` が Valid Configuration  
  - `my-10.com` → `www.my-10.com` の 307 リダイレクトも一般的な運用で問題ありません。

- **Vercel 環境変数**  
  - `NEXT_PUBLIC_SITE_URL`、Supabase 用の `NEXT_PUBLIC_SUPABASE_*` が設定されており、本番ドメインと整合しています。  
  - `NEXT_PUBLIC_` の公開範囲も Supabase の想定どおりです。

- **Google のリダイレクト URI**  
  - Supabase のコールバック URL と、`https://my-10.com/auth/callback` が登録されており、現在の認証フローと一致しています。

- **お名前.com**  
  - `www` の CNAME が Vercel を向いており、NS はお名前.com のデフォルトで問題ありません。

---

## 対応の優先順位の目安

1. **最優先**  
   - Supabase の **Redirect URLs** に上記 2 つ（またはワイルドカード）を追加  
   - これがないと、本番ドメインでログイン後に「リダイレクト URL が許可されていない」などのエラーになりやすいです。

2. **次**  
   - お名前.com のルートドメイン A レコードを **76.76.21.21** に変更（現在 216.198.79.1 の場合）  
   - Google の **承認済みの JavaScript 生成元** に `https://my-10.com` と `https://www.my-10.com` を追加  

3. **余裕があれば**  
   - `NEXT_PUBLIC_SITE_URL` の末尾スラッシュを Supabase と揃える  

以上を反映すれば、本番ドメインでの認証と表示はかなり安定すると考えられます。
