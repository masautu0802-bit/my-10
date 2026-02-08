# マイ10 外部設計書（External Design Document）

## 1. サービス概要

### 1.1 サービス名

マイ10（My10）

### 1.2 コンセプト

「**なんか欲しいけど、何が欲しいかわからない**」というモヤモヤを、
**他ユーザーの価値観が詰まった“10個の厳選商品”**を見ることで解消する発見型Webサービス。

### 1.3 提供価値

* ユーザーの実体験・価値観に基づいたレコメンドによる高い発見性
* 膨大な選択肢ではなく、**絞り込まれた10個**による意思決定のしやすさ
* 自分と似た好みのユーザーをフォローし、継続的に楽しめる

---

## 2. 想定ユーザー・利用シーン

### 2.1 メインターゲット

* 30〜40代女性
* ライフスタイル改善・自己投資・健康・趣味領域に関心

### 2.2 利用シーン

* 通勤中の電車内
* 1回あたり約20分
* スマートフォンでの利用が中心

### 2.3 利用後の理想状態

* 気になるショップを1〜2件フォローしている
* 別タブでECサイトを開き、商品を検討している

---

## 3. 全体構成・ページ一覧（MVP）

| No | ページ名          | 概要             | 認証        |
| -- | ------------- | -------------- | --------- |
| 1  | トップページ        | ショップ一覧（縦スクロール） | 不要        |
| 2  | ショップ詳細        | オーナーの10商品を表示   | 不要        |
| 3  | 商品詳細          | 商品説明＋外部ECリンク   | 不要        |
| 4  | ログイン／新規登録     | Supabase Auth  | 不要（操作時のみ） |
| 5  | マイページ         | フォロー・保存一覧      | 必須        |
| 6  | プロフィール編集      | ユーザー情報編集       | 必須        |
| 7  | 出店者管理ページ（CMS） | ショップ・商品管理      | 必須        |

※ 検索・カテゴリページはMVPでは非対応

---

## 4. 画面別外部仕様

## 4.1 トップページ

### 目的

* ユーザーに「覗いてみたいショップ」を発見させる

### 表示仕様

* 縦スクロール（商店街UI）
* 1画面あたり4ショップ表示
* 初期表示順：フォロワー数順（人気順）

### ショップカード表示項目

* ショップ名
* オーナー名
* テーマ（例：ピラティス初心者向け）
* 1押し商品（画像＋商品名）

---

## 4.2 ショップ詳細ページ

### 目的

* オーナーの価値観・世界観を伝える

### 表示仕様

* 商品は最大10点まで
* 表示順はオーナーが自由に設定

### 表示項目

* ショップ名
* オーナー名
* ショップ説明文（任意）
* 商品一覧（最大10件）

---

## 4.3 商品詳細ページ

### 表示項目

* 商品名
* 商品画像
* オーナーコメント（一言）
* 価格帯（例：¥5,000〜¥10,000）
* 外部ECサイトへのリンク

※ タグ機能はMVPでは非対応

---

## 4.4 マイページ

### 表示内容

* フォロー中のショップ一覧
* 保存した商品一覧
* 新着更新通知（ショップ更新時）

---

## 4.5 出店者管理ページ（簡易CMS）

### 対象

* 全ユーザー（出店制限なし）

### 機能

* ショップ情報の作成・編集
* 商品（最大10件）の登録・編集
* 商品表示順の並び替え

---

## 5. ユーザーアクション一覧

| アクション    | ログイン要否 |
| -------- | ------ |
| 閲覧       | 不要     |
| ショップフォロー | 必要     |
| 商品保存     | 必要     |
| 出店       | 必要     |

---

## 6. 非機能要件（外部設計レベル）

* モバイル最優先設計（SP First）
* PC・タブレットはレスポンシブ対応
* 想定同時接続数：〜100
* 言語：日本語のみ

---

## 7. 技術スタック（前提）

* フロントエンド：React / Next.js
* 認証：Supabase Auth
* データベース：Supabase（PostgreSQL）
* ホスティング：Vercel

---

## 8. 今後の拡張前提（参考）

* レコメンドアルゴリズム導入

  * ユーザー嗜好 × フォロー × 行動履歴
* トップページのパーソナライズ
* タグ・検索機能追加
* 相互作用（いいね・コメント）

---

## 9. 外部設計書の位置づけ

本書は、

* UI設計（Stitch）
* Claude Code / Cursor による実装
* 内部設計書作成

の**共通インプット資料**として使用する。

以下に各ページのコードを記述します。
実装の際はこれらを参考にしてください。

・トップページ

<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>マイ10 トップページ (グリッド表示)</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<style type="text/tailwindcss">
    :root {
        --background-warm: #F8EDE3;
        --accent-sage: #A2B29F;
        --text-dark: #4A4A4A;
        --card-white: #FFFFFF;
        --accent-coral: #E68369;}
    .font-sans-jp {
        font-family: 'Poppins', 'Noto Sans JP', sans-serif;
    }
</style>
<script>
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    bgwarm: 'var(--background-warm)',
                    sage: 'var(--accent-sage)',
                    dark: 'var(--text-dark)',
                    surface: 'var(--card-white)',
                    coral: 'var(--accent-coral)',
                },
                boxShadow: {
                    'soft': '0 4px 20px -2px rgba(162, 178, 159, 0.15)',
                },
                borderRadius: {
                    '3xl': '1.5rem',
                }
            }
        }
    }
</script>
<style>
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    body {
        min-height: max(884px, 100dvh);
    }
</style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-bgwarm font-sans-jp antialiased text-dark">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-bgwarm shadow-2xl">
<header class="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md px-5 py-4 flex items-center justify-between shadow-sm border-b border-sage/10">
<div class="flex items-center gap-1">
<span class="text-2xl font-extrabold tracking-tight text-sage">My10</span>
<div class="h-1.5 w-1.5 rounded-full bg-coral mt-1.5"></div>
</div>
<div class="flex items-center gap-3">
<button class="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-dark hover:bg-sage hover:text-white transition-colors">
<span class="material-symbols-outlined text-[22px]">search</span>
</button>
<button class="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-dark hover:bg-sage hover:text-white transition-colors relative">
<span class="material-symbols-outlined text-[22px]">notifications</span>
<span class="absolute top-2 right-2.5 w-2 h-2 bg-coral rounded-full border border-white"></span>
</button>
</div>
</header>
<main class="flex-1 pb-28">
<section class="px-5 pt-6 pb-2">
<div class="flex items-center justify-between mb-4">
<h2 class="text-lg font-bold text-dark tracking-tight">見つける</h2>
<a class="text-xs font-bold text-sage hover:text-sage/80 flex items-center gap-1" href="#">
                    すべて見る
                    <span class="material-symbols-outlined text-xs">arrow_forward</span>
</a>
</div>
<div class="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5 snap-x">
<div class="snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer">
<div class="w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br from-coral to-sage relative">
<div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 bg-cover bg-center shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-SvvgW4LirKJOGNKLjmvIQZhX4nqMd6P3coH4zyP9IZZTF_fk90npnhtnkIbfD60PWFV4l-X6Bzu8YplvUc4mz3Sv8AwCyWS3IM-fNF0SHkzbZqyDBO7M4Z-oYpQhKwaN17jUw_5YeC3A90YID1DcvJtvwlHTMCrp1cB9ls8OCkY-jX2oUp6h-rd9WJFPPhtqB7cwhkctCOVV_lyhm5-hbQ0alF0NKkT0FZxctOFMEsPZz4id-rOxGktxn31pEHyj8Ay46t32nIyZ');"></div>
<div class="absolute -bottom-0.5 -right-0.5 bg-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white">Hot</div>
</div>
<span class="text-[10px] font-bold text-center text-dark/80 group-hover:text-coral transition-colors">編集部ピック</span>
</div>
<div class="snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer">
<div class="w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br from-sage to-teal-300">
<div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 bg-cover bg-center shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsOPWVedkV0h0hwO8W1dcIFQuuImHSE7VwbpyuyryssKBjKHGHHjxL16P8lbJE-o22qDK2TwtBrC8Gj-2L_P7p5GpdeCr7nd0iyYOMTdKvuqdRqMjdlnaAmqPLTfRT03BpQGfv2wF-bbOkqz6jS7ShO4D3_5Fr9Dc2rEyU_0ja2Uk_se1_QwlUuc5R_16enPatas_vZjD3ZNi_ueJnUG2jwg0H2RP3HmP8ybkaFwmRtImRcMNp-x80NTgeHO7QVp6W8IlAcpxuPFU6');"></div>
</div>
<span class="text-[10px] font-bold text-center text-dark/80 group-hover:text-sage transition-colors">トレンド</span>
</div>
<div class="snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer">
<div class="w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br from-yellow-300 to-orange-300">
<div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 bg-cover bg-center shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNZNZIsi4S-rTzGADb0r7G_gzy8k2lYC63ajVwV4RKMWyk_toodK05LEVCF8pI4JOQqZtpqgmv4mA-qfax3Ru7PGICiy0_AqZ80j6GTQCw8JD0lvKwP7bsTJdL1Pu_GbFt8kXLQ7MevA9VNnoraIpvjxsiw1UzirQPu2zQO6SbznakjKDEyFf-jUzBASzwO6gkrNVXVllgAsPArJsICX2tk9geH1_-xmDw91ppk76zSMFZeoCrwtLRDEng0frpGNnDv-E9_Mk8PYI8');"></div>
</div>
<span class="text-[10px] font-bold text-center text-dark/80 group-hover:text-yellow-500 transition-colors">新着</span>
</div>
<div class="snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer">
<div class="w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br from-purple-300 to-pink-300">
<div class="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 bg-cover bg-center shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7S0WGLX5c9NE9zd6as5IoAfIX7yY6cvMi2xdtvubMZiduzM6C7NfsHok3-86elKcXAptlNC0Gz1vv6QHvoFgtmmsUafQRB9gdmIHSAMiuqYdVc_OS_P6yH8vt21r9AaWeeEKiO2-eggoqOYHor3TbFsAA0vjMi39f3ptwjmj-BDG8sYsmt6xzMCZ2rLbWNXRgj_DukYRyVi9U7LTHdXGOYFne37q-fW5p5tKziP7Hj43gwMRd9c3kj4pmnm_0IX9sN9nh9FcFgQa4');"></div>
</div>
<span class="text-[10px] font-bold text-center text-dark/80 group-hover:text-purple-500 transition-colors">おすすめ</span>
</div>
</div>
</section>
<section class="mt-2 px-4">
<div class="flex items-center gap-2 mb-4">
<div class="p-1.5 bg-sage/20 rounded-lg text-sage">
<span class="material-symbols-outlined text-[18px]">storefront</span>
</div>
<h3 class="text-xl font-bold tracking-tight text-dark">厳選ショップ</h3>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-qGaIs8YjT8wacI_heirATNGVKXNk5Y2_SaJ_Izm7CzLOZQ-gHveGEqnZwOdGPLN7WizJnQNhPTZAxW6HbP2kAw3QQ1py544o7RGhQ3wgCAd2ymrXfGosdJ0C3liunXdMLYSWUpq47ndqepztVXFfhfRieeiVKfcDRsnNUGJWIFs2udKvHBJglomV_sYaI_LaUTLl2jlL6n81WHEF0irze3AccBY3TeROTL_FcgmLwLaqexf7x7pnGB_swtFJ0YSrpzaCqLwoypp_');"></div>
<div class="absolute top-2 left-2">
<div class="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-sage"></span>
                                仕事環境
                            </div>
</div>
<div class="absolute bottom-2 right-2">
<div class="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA192FVfWSGiJqePG6WWJ_tzps4AxrGKL3QMnP3hHAhPBJYLu3ZNs7ra1JGcNX3yNjTIQjCLFL2d-NZwEu0mK-uP4UDlQnIEahCa5jT5quDCSRUADX3I0OXd3PU9cRi6zbspYdV-QK7Z8gENdRXsoWWb1KmBMEWXTK8buCxJGpv9Nhco8uod0kgjAaaOu-Bz6fZjo97GrZ0D6cvHcOzxjSCK4xdv_t70YmszFWao3Qo-thjM3OzTtX5m3LHf-g1OAB6i4yw_uqW8eEZ');"></div>
</div>
</div>
<div class="p-3 flex flex-col gap-1">
<h4 class="text-sm font-bold text-dark truncate">コージー・デスク</h4>
<span class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">by サラ・J</span>
<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
<div class="flex items-center gap-1 text-gray-400">
<span class="material-symbols-outlined text-[14px] text-sage">favorite</span>
<span class="text-[10px] font-semibold">1.2k</span>
</div>
<span class="text-[10px] font-bold text-sage">詳細</span>
</div>
</div>
</div>
<div class="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZbPNZMRNECThFoO4TM08chdMKDB3_52vvZKI2L7WCu9tLoDaTLxalsfZgm80UwLvSHPYPGTevWRtu4ixU7QD4ulpsTYn6P1MH8ng5ivmgOc8pTN3UupZeRZTMRmpjaCN4AxgnL2ICvqqd3B7B3A5IbfIhCuAVBNoYMZTpXK0tS7awUNjin5LT8t1kZW0IT_jrFfXfUUMw5KJCeKt5P9kAtMuRO7rzjZD2nyrRWh2EEcRgNuwIT6p1DzaCodyfrIvz7h9SBLbf18HO');"></div>
<div class="absolute top-2 left-2">
<div class="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-coral"></span>
                                ピラティス
                            </div>
</div>
<div class="absolute bottom-2 right-2">
<div class="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBj3klEqj7WjmPXjLGHTGWwhRiWrQ6r0cpxf9cGkj09EdBFk2ZmdveBXo1po3XikqJbam-sthlO59P48NvZb-JdEix9Av60eGzV05LaApb7z8AKa9h7Lj4cyLwbhrtuPQYbVxZxFScUoJsmGQIG9o14P3Ncwpf3E2RGt_YMQbNWHiUbP4CxT00mkUJcxwSRPsiVKBS8vL0xsd5gejCUfmcGXS7NmOwohWhdUczue_eIXd-J7UIlXYDrZTAvQAZnbH47eN3cHoptT0Iz');"></div>
</div>
</div>
<div class="p-3 flex flex-col gap-1">
<h4 class="text-sm font-bold text-dark truncate">ムーブ・ウェル</h4>
<span class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">by エレナ・R</span>
<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
<div class="flex items-center gap-1 text-gray-400">
<span class="material-symbols-outlined text-[14px] text-coral">favorite</span>
<span class="text-[10px] font-semibold">850</span>
</div>
<span class="text-[10px] font-bold text-sage">詳細</span>
</div>
</div>
</div>
<div class="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQTzHOTC2aCh9czvTwqk2cGRNAi5GCibklQuL0ETlPgtXzp-KvePkX-08kfMgQGQzbhOWOJCngx8J-YyeruJ3dPbhYIfyOWwn8Cfvms8ss76rSyQt26kbLYo523UrhXjEznkPVn9ttpHLTg39sVFsjIM9HL58lAUtWXQOUihWA7rGj8A9DeC5pnGOqOvcLRH-fTTg1KipUJ9lQNngpxLZAt2fJFz7do9ck0pYMZk4PrFP3SxFcOBAAfk4iaKkbNCbeessjRCQczR1-');"></div>
<div class="absolute top-2 left-2">
<div class="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                ブランチ
                            </div>
</div>
<div class="absolute bottom-2 right-2">
<div class="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFA1CHTjcZ0HjkLgZRDyWYuUfaa5MVvA4-L3i-4hSUxO4c2qSIInS4zZitKOMONrqkoAfXDpmKwG318GP7fjaeeK2NMkYSYX63Ni1w8tbSVYptsO1fv4EFJcbrTJ4N4AVFI39aZSXYyYXVGBoGT3VN1mf9PSJR_xwDYp_seek95JoQV_IHEFdIO2Vqm3CcfWT1mxMuTlWjeMSB-ItCcWWXrG_Kl6DENRiXQykriEHmk6fzFf-PPq_y5QvGC-bc-sPf6gn5DB6G7szi');"></div>
</div>
</div>
<div class="p-3 flex flex-col gap-1">
<h4 class="text-sm font-bold text-dark truncate">週末のワードローブ</h4>
<span class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">by ミア・T</span>
<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
<div class="flex items-center gap-1 text-gray-400">
<span class="material-symbols-outlined text-[14px] text-sage">favorite</span>
<span class="text-[10px] font-semibold">3.4k</span>
</div>
<span class="text-[10px] font-bold text-sage">詳細</span>
</div>
</div>
</div>
<div class="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-SvvgW4LirKJOGNKLjmvIQZhX4nqMd6P3coH4zyP9IZZTF_fk90npnhtnkIbfD60PWFV4l-X6Bzu8YplvUc4mz3Sv8AwCyWS3IM-fNF0SHkzbZqyDBO7M4Z-oYpQhKwaN17jUw_5YeC3A90YID1DcvJtvwlHTMCrp1cB9ls8OCkY-jX2oUp6h-rd9WJFPPhtqB7cwhkctCOVV_lyhm5-hbQ0alF0NKkT0FZxctOFMEsPZz4id-rOxGktxn31pEHyj8Ay46t32nIyZ');"></div>
<div class="absolute top-2 left-2">
<div class="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                アート
                            </div>
</div>
<div class="absolute bottom-2 right-2">
<div class="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7S0WGLX5c9NE9zd6as5IoAfIX7yY6cvMi2xdtvubMZiduzM6C7NfsHok3-86elKcXAptlNC0Gz1vv6QHvoFgtmmsUafQRB9gdmIHSAMiuqYdVc_OS_P6yH8vt21r9AaWeeEKiO2-eggoqOYHor3TbFsAA0vjMi39f3ptwjmj-BDG8sYsmt6xzMCZ2rLbWNXRgj_DukYRyVi9U7LTHdXGOYFne37q-fW5p5tKziP7Hj43gwMRd9c3kj4pmnm_0IX9sN9nh9FcFgQa4');"></div>
</div>
</div>
<div class="p-3 flex flex-col gap-1">
<h4 class="text-sm font-bold text-dark truncate">キャンバス＆クレイ</h4>
<span class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">by レオ・D</span>
<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
<div class="flex items-center gap-1 text-gray-400">
<span class="material-symbols-outlined text-[14px] text-sage">favorite</span>
<span class="text-[10px] font-semibold">920</span>
</div>
<span class="text-[10px] font-bold text-sage">詳細</span>
</div>
</div>
</div>
<div class="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCW94ZYZbVD-zx4yU5wl7wSoDBXe-8BB7n6ngelyvG-msCsGigunJPLgC4ZwCQbu8K8h6jCVa6wPxS-rG6qi2biS-u1eU2jSEAFSnHc6uI3dWkLqRKo-cIAB0uZzTYdtmmDYWJDttXITMqGn6_QxrrAKqDw7uvBQRYXnp_zJbdK7QzKJUlr7kStXj5AN4kBE0vkS9niNsLTwrwVQ98ySzxsFrYTvuUfGW4lLPffJKKr2vWkhEe0uhQLFi3QNyD1YAn_KjQeBt2-L33U');"></div>
<div class="absolute top-2 left-2">
<div class="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                テック
                            </div>
</div>
<div class="absolute bottom-2 right-2">
<div class="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA192FVfWSGiJqePG6WWJ_tzps4AxrGKL3QMnP3hHAhPBJYLu3ZNs7ra1JGcNX3yNjTIQjCLFL2d-NZwEu0mK-uP4UDlQnIEahCa5jT5quDCSRUADX3I0OXd3PU9cRi6zbspYdV-QK7Z8gENdRXsoWWb1KmBMEWXTK8buCxJGpv9Nhco8uod0kgjAaaOu-Bz6fZjo97GrZ0D6cvHcOzxjSCK4xdv_t70YmszFWao3Qo-thjM3OzTtX5m3LHf-g1OAB6i4yw_uqW8eEZ');"></div>
</div>
</div>
<div class="p-3 flex flex-col gap-1">
<h4 class="text-sm font-bold text-dark truncate">モダン・ガジェット</h4>
<span class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">by アレックス・K</span>
<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
<div class="flex items-center gap-1 text-gray-400">
<span class="material-symbols-outlined text-[14px] text-sage">favorite</span>
<span class="text-[10px] font-semibold">2.1k</span>
</div>
<span class="text-[10px] font-bold text-sage">詳細</span>
</div>
</div>
</div>
<div class="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
<div class="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsOPWVedkV0h0hwO8W1dcIFQuuImHSE7VwbpyuyryssKBjKHGHHjxL16P8lbJE-o22qDK2TwtBrC8Gj-2L_P7p5GpdeCr7nd0iyYOMTdKvuqdRqMjdlnaAmqPLTfRT03BpQGfv2wF-bbOkqz6jS7ShO4D3_5Fr9Dc2rEyU_0ja2Uk_se1_QwlUuc5R_16enPatas_vZjD3ZNi_ueJnUG2jwg0H2RP3HmP8ybkaFwmRtImRcMNp-x80NTgeHO7QVp6W8IlAcpxuPFU6');"></div>
<div class="absolute top-2 left-2">
<div class="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
<span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                エコ
                            </div>
</div>
<div class="absolute bottom-2 right-2">
<div class="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBj3klEqj7WjmPXjLGHTGWwhRiWrQ6r0cpxf9cGkj09EdBFk2ZmdveBXo1po3XikqJbam-sthlO59P48NvZb-JdEix9Av60eGzV05LaApb7z8AKa9h7Lj4cyLwbhrtuPQYbVxZxFScUoJsmGQIG9o14P3Ncwpf3E2RGt_YMQbNWHiUbP4CxT00mkUJcxwSRPsiVKBS8vL0xsd5gejCUfmcGXS7NmOwohWhdUczue_eIXd-J7UIlXYDrZTAvQAZnbH47eN3cHoptT0Iz');"></div>
</div>
</div>
<div class="p-3 flex flex-col gap-1">
<h4 class="text-sm font-bold text-dark truncate">グリーン・ライフ</h4>
<span class="text-[10px] font-medium text-gray-400 uppercase tracking-wide">by サム・W</span>
<div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
<div class="flex items-center gap-1 text-gray-400">
<span class="material-symbols-outlined text-[14px] text-sage">favorite</span>
<span class="text-[10px] font-semibold">1.5k</span>
</div>
<span class="text-[10px] font-bold text-sage">詳細</span>
</div>
</div>
</div>
</div>
<div class="h-8"></div>
</section>
</main>
<nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sage/10 pb-8 pt-4 px-6 max-w-md mx-auto rounded-t-[2rem] shadow-[0_-5px_20px_rgba(162,178,159,0.1)]">
<div class="flex justify-between items-center px-2">
<button class="flex flex-col items-center gap-1.5 w-16 group">
<div class="p-1.5 bg-sage/10 rounded-xl group-hover:bg-sage/20 transition-colors">
<span class="material-symbols-outlined text-sage" style="font-variation-settings: 'FILL' 1;">home</span>
</div>
<span class="text-[10px] font-bold text-sage">ホーム</span>
</button>
<button class="flex flex-col items-center gap-1.5 w-16 text-gray-400 hover:text-sage transition-colors group">
<div class="p-1.5 rounded-xl group-hover:bg-sage/10 transition-colors">
<span class="material-symbols-outlined">search</span>
</div>
<span class="text-[10px] font-bold">検索</span>
</button>
<button class="flex flex-col items-center gap-1.5 w-16 text-gray-400 hover:text-sage transition-colors group">
<div class="p-1.5 rounded-xl group-hover:bg-sage/10 transition-colors">
<span class="material-symbols-outlined">store</span>
</div>
<span class="text-[10px] font-bold">マイショップ</span>
</button>
<button class="flex flex-col items-center gap-1.5 w-16 text-gray-400 hover:text-sage transition-colors group">
<div class="relative w-8 h-8">
<div class="w-full h-full rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-sage transition-all">
<div class="w-full h-full bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCW94ZYZbVD-zx4yU5wl7wSoDBXe-8BB7n6ngelyvG-msCsGigunJPLgC4ZwCQbu8K8h6jCVa6wPxS-rG6qi2biS-u1eU2jSEAFSnHc6uI3dWkLqRKo-cIAB0uZzTYdtmmDYWJDttXITMqGn6_QxrrAKqDw7uvBQRYXnp_zJbdK7QzKJUlr7kStXj5AN4kBE0vkS9niNsLTwrwVQ98ySzxsFrYTvuUfGW4lLPffJKKr2vWkhEe0uhQLFi3QNyD1YAn_KjQeBt2-L33U');"></div>
</div>
</div>
<span class="text-[10px] font-bold">プロフィール</span>
</button>
</div>
</nav>
</div>

</body></html>


・ショップ詳細ページ

<!DOCTYPE html>
<html class="dark" lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ショップ詳細 - ハーブのある暮らし</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300..900&amp;family=Noto+Sans+JP:wght@300..900&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "natural-bg": "#F8EDE3",
                        "natural-accent": "#A2B29F",
                        "natural-text": "#798777",
                        "natural-secondary": "#BDD2B6",
                        "natural-surface": "#FFFFFF",
                        "background-light": "#F8EDE3",
                        "background-dark": "#2C332A",
                        "surface-light": "#ffffff",
                        "surface-dark": "#3A4238",
                    },
                    fontFamily: {
                        "display": ["Outfit", "Noto Sans JP", "sans-serif"],
                        "sans": ["Outfit", "Noto Sans JP", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "full": "9999px"},
                    boxShadow: {
                        'soft': '0 4px 20px -2px rgba(121, 135, 119, 0.1)',
                        'soft-hover': '0 8px 25px -5px rgba(121, 135, 119, 0.15)',
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
        }
        .material-symbols-outlined.filled {
            font-variation-settings:
            'FILL' 1,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .pattern-dots {
            background-image: radial-gradient(#A2B29F 1.5px, transparent 1.5px);
            background-size: 20px 20px;
            opacity: 0.4;
        }
        .pattern-grid {
            background-size: 40px 40px;
            background-image: linear-gradient(to right, rgba(121, 135, 119, 0.05) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(121, 135, 119, 0.05) 1px, transparent 1px);
        }
        .masonry-grid {
            column-count: 2;
            column-gap: 1rem;
        }
        .masonry-item {
            break-inside: avoid;
            margin-bottom: 1rem;
        }
        body {
          min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-[#F8EDE3] font-sans text-[#798777] min-h-screen flex flex-col antialiased pattern-grid selection:bg-[#A2B29F] selection:text-white">
<div class="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#F8EDE3]/90 backdrop-blur-md transition-all">
<button class="flex items-center justify-center size-10 rounded-full bg-white/80 border border-[#A2B29F]/20 shadow-sm hover:bg-[#BDD2B6]/20 transition-all text-[#798777]">
<span class="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
</button>
<h2 class="text-base font-semibold tracking-wide uppercase opacity-0 transition-opacity duration-300 hidden sm:block text-[#798777]">ハーブのある暮らし</h2>
<button class="flex items-center justify-center size-10 rounded-full bg-white/80 border border-[#A2B29F]/20 shadow-sm hover:bg-[#BDD2B6]/20 transition-all text-[#798777]">
<span class="material-symbols-outlined text-[20px]">ios_share</span>
</button>
</div>
<main class="flex-1 pb-32">
<div class="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 pointer-events-none">
<div class="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-[#BDD2B6]/30 blur-3xl opacity-60"></div>
<div class="absolute top-10 -left-10 w-72 h-72 rounded-full bg-[#A2B29F]/20 blur-3xl opacity-60"></div>
</div>
<div class="px-6 pt-2 pb-8 flex flex-col items-center text-center relative">
<div class="relative group cursor-pointer mb-5">
<div class="size-28 rounded-full p-1 border border-[#A2B29F]/30 bg-white/50">
<div class="size-full rounded-full bg-cover bg-center overflow-hidden" data-alt="Woman holding green plants" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnTLE6-hzSfmF0GVXzl7xc2ml7qYNUIsT3KBdR0RCW58RjOb8Yo4pxhALL4yZife4vxTi1Cr2cxw7FeERvWANKfiYpD-w6cQnBr3Kd0HGsDiSrbOzwZpQX6zmpau8t8IcMkrbOE3u3Jdpc_OEovgs2x8u-NDEaJZFpND7ZMD8CxmIc55L2EYVQKPVUXwu00MtwEvB5ALrZNOxLolHYb1Fr98CRu6E5bz5MCXqaBiqpWyhBIQRAjqUnNtVKGCBhK5puKH_3zAYojBMt');"></div>
</div>
<div class="absolute bottom-0 right-0 bg-[#A2B29F] text-[#F8EDE3] rounded-full p-1 shadow-sm border-2 border-[#F8EDE3]">
<span class="material-symbols-outlined text-[16px]">verified</span>
</div>
</div>
<h1 class="text-2xl font-bold tracking-tight mb-2 text-[#798777] font-display">ハーブのある暮らし</h1>
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 bg-white/40 border border-[#A2B29F]/10">
<span class="size-1.5 rounded-full bg-[#A2B29F]"></span>
<p class="text-[#798777] text-xs font-medium uppercase tracking-wider">Curator: サラ・ジェンキンス</p>
</div>
<div class="flex gap-10 mb-8 text-sm bg-white/60 backdrop-blur-sm px-8 py-3 rounded-2xl border border-[#A2B29F]/10 shadow-soft">
<div class="flex flex-col items-center gap-0.5">
<span class="font-bold text-lg text-[#798777]">1.2k</span>
<span class="text-[#798777]/80 text-[10px] uppercase tracking-wider">フォロワー</span>
</div>
<div class="w-px h-auto bg-[#798777]/20"></div>
<div class="flex flex-col items-center gap-0.5">
<span class="font-bold text-lg flex items-center gap-1 text-[#798777]">4.9 <span class="material-symbols-outlined text-[#A2B29F] text-sm filled">star</span></span>
<span class="text-[#798777]/80 text-[10px] uppercase tracking-wider">評価</span>
</div>
</div>
<button class="w-full max-w-[200px] bg-[#A2B29F] text-[#F8EDE3] font-medium text-base py-3 px-6 rounded-full shadow-soft hover:shadow-soft-hover hover:bg-[#8F9E8C] active:translate-y-[1px] transition-all mb-8 flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[20px]">add</span>
                フォローする
            </button>
<div class="relative max-w-md mx-auto px-4">
<p class="text-[#798777] text-sm leading-relaxed text-center italic">
                    "丁寧な暮らしのための、厳選されたボタニカルアイテム。植物の癒しの力と持続可能な生活を大切にしています。"
                </p>
</div>
<div class="flex gap-3 mt-8 flex-wrap justify-center">
<span class="px-4 py-1.5 rounded-full bg-white/80 text-[#798777] border border-[#A2B29F]/20 text-xs font-medium tracking-wide hover:bg-[#A2B29F]/10 transition-colors cursor-default shadow-sm">オーガニック</span>
<span class="px-4 py-1.5 rounded-full bg-white/80 text-[#798777] border border-[#A2B29F]/20 text-xs font-medium tracking-wide hover:bg-[#A2B29F]/10 transition-colors cursor-default shadow-sm">ホーム</span>
<span class="px-4 py-1.5 rounded-full bg-white/80 text-[#798777] border border-[#A2B29F]/20 text-xs font-medium tracking-wide hover:bg-[#A2B29F]/10 transition-colors cursor-default shadow-sm">ウェルネス</span>
</div>
</div>
<div class="px-6 py-4 flex items-center justify-between sticky top-[72px] z-30 bg-[#F8EDE3]/95 backdrop-blur-md border-t border-[#A2B29F]/10">
<h3 class="text-lg font-bold tracking-tight flex items-center gap-2 text-[#798777]">
                コレクション
                <span class="text-[10px] bg-[#A2B29F]/20 text-[#798777] px-2 py-0.5 rounded-full font-medium">8 アイテム</span>
</h3>
<div class="flex gap-1">
<button class="p-2 rounded-lg text-[#798777] hover:bg-[#A2B29F]/10 transition-colors">
<span class="material-symbols-outlined text-[20px]">grid_view</span>
</button>
<button class="p-2 rounded-lg text-[#798777]/60 hover:text-[#798777] hover:bg-[#A2B29F]/10 transition-colors">
<span class="material-symbols-outlined text-[20px]">view_list</span>
</button>
</div>
</div>
<div class="masonry-grid px-4 sm:px-6 pt-2 pb-8">
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[4/5] overflow-hidden">
<img alt="ドライラベンダーの束" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Dried lavender flowers in rustic paper" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDEx0DCB7J9wkVcUuz3H9TQuXy89WnA_m-2EGnr3l7HmPzRKKQ9cd9UKLr2nXcQbUlIrvB7YfhSSTAApnvsHtWjJFCKH17RI5Y_RFeblyChfcmF3LEgdiQhmx1hxKEWgQu0aw87bU3kMlv73uVzpKunHaOciEFWeRdY4wVBUys5eN5X6uPmNdjVVgBdDM_24IWBL5eclohHmQ7qtYN-HAAsVuTbwTikPiKJ0C4wpp4quGxB04AzNF96pGvjZ5txH2WU36xoeLd-Lda"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px] filled text-[#A2B29F]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">ドライラベンダーの束</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥1,980</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[3/4] overflow-hidden">
<img alt="陶器のハーブプランター" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="White ceramic pot with green plant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtUx_nVD2nyriu0SCS__zygqikN9ydEkzBWzOW57qTPwe0uwJchW2EkxmtsDrNlO59WZLHkbJqjc43b-yQdGNRnohNNg4pQ0tOF0sVtBmHZs0Y1BsNEIUzQk4fEzNb2s_OtuLu9Xb5daF35SLmsvUpHo1v-BbqT7CwvxUcOJuUlBaShX4RIK5JgSi8jW4_LZ7U8N4r1HgRb4GhX0v6LeDm2DnhkIW6tp0r3Rwj8gnEsjrfyU9u1tu5qW4W-aRp3D2mekP3PBZJg4-3"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">陶器のハーブプランター</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥4,950</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[1/1] overflow-hidden">
<img alt="チーク材のスプーンセット" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Wooden spoons on a table" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMVUtaQFg8Ae5-vAtBt2pZogOMnYvD_2tDgGdy4pVnrIPr6IDn1MNewc0ETrvp7doR1nPw9-45uS3NGBQpNyPbqJl3q-sGkeupTnrQSQn181uPhCrjLkIm6UYHDDBqUZBPCIEosDXv3VslmGU6qGvuUU5HEf4Jw53ks57XL8Co1s34BlUwN55sPc9_dPJHddDasd5pnQJ4pQyx2tRw8DcBoAELQ9X9OvheAsEswkHEXj8kHjjlfsy-aBJooEFhCr9l-B8ytaUacPSJ"/>
</div>
<div class="absolute top-3 left-3">
<span class="text-[10px] font-bold uppercase tracking-wider text-[#F8EDE3] bg-[#A2B29F]/90 px-2 py-1 rounded shadow-sm">ベストセラー</span>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">チーク材のスプーンセット</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥3,300</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[4/5] overflow-hidden">
<img alt="オーガニックローズマリーオイル" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Amber glass dropper bottle with oil" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArQJqt0RHt7vL65J9GCjOFa7eyNdaR-qEMH3G-AndR2qzYMcZjXcv-N3nH0idIp7Hwy5lAZw5EWat77fkGTk1-Qvr4Reh6eSGPF7vl121ggcZl6v0QXpnDK0OxvL-c_E9bVNsecHtMDbP_Vi5joImo6f4cbIFGThD8TIC5g63OzK6LL43vDxeZ1ByODL3pFlPeYXQKiLfsLVzSxVc7IX0R1KVegHlQo50Ed-tLQVpOCZYODJhIGgE4UjKCHvbid6rQesNv_o8uRYiC"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">オーガニックローズマリーオイル</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥2,420</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[4/5] overflow-hidden">
<img alt="ソイワックスキャンドル" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Minimalist candle in glass jar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYeQJiN545dbqjMI74_f-OGHQtQTbTrrel-Ag_Bpntv3NI3Uur8YT8XgV6D_opqvXs3V_pgkg9c2cO_3McFtuqXX8sK1M3ZYLafPvShOpgN8WsFRq8De0TsmsM9b7KramxPd-RPA_2YUjvh4mjHtisKh0zGjbAe4tB9a8JmjYyEwTA9qE-RfqIOxQN73fz2fqbHMQrQ8vmcHdG7hGZEFxD7mUWYzTl8hkmU1OjNWz7ZLlwoARvhpEhW1BtRq1YwTaU6mYOy-5YJDJ9"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">ソイワックスキャンドル</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥3,080</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[1/1] overflow-hidden">
<img alt="安眠ハーブティーブレンド" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Loose leaf tea in a jar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpQrO6nFh4ZVuRE5oeQJbHWa-31lDt75AW1pt5pqNd2ritgpJI8HXtF0m2GCJ82rwNbHg-mA5FqYo7kFkZT6qhAhlmOIBwuz3NCIraELJyGcBFZ7zCOf4nSh4TjKbkcfuC_usUft8nccSYsR73MyaprAuanq0ENqhozvkG0778E43hxkVJcGHlUZxe7fwUV6Ow2fxcrCD144SSlyVvu2UBczSyCio5_YFVX_LjwTI-DwtMSQUwglXraweBIIUHdVrrUJ5KvijqKD97"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">安眠ハーブティーブレンド</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥1,815</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[3/4] overflow-hidden">
<img alt="ボタニカルアートポスター" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Framed botanical illustration of a fern" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8oplU3CuKKdOkkg855agR1x8vohz2OriGeHS-H4IPNzdpnyMxJs-r6TfH2Qxz1acS6nDSVQX5ZzM-XDMrr7CvOsaAGbVao43aC0rmDB3goDgQOAoUTL-RbWV5vF2ua7nAQ67C8DbfmshMm4LFlvOCObhKBBCLREm_Aj4gBJz331uX2WmK82cPj0Kisp14Tfh5_MONwAzwycm2JJWFeOmmLu5agp-11QA9GHgMsS8vJJsizsG4qFPa0XLwdJdEbGiQ6kJGpy8Cb209"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">ヴィンテージ・シダポスター</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥3,850</p>
</div>
</div>
</div>
<div class="masonry-item group relative">
<div class="relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#A2B29F]/10 hover:border-[#A2B29F]/30 transition-all duration-300">
<div class="aspect-[4/5] overflow-hidden">
<img alt="リネンキッチンタオル" class="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" data-alt="Folded beige linen towel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbOwkrb9rbB3eo5FEsWMc5gpfQMdeTLu6XmCCvDDpPwqJOo0CLwNyP3cJ8W4QJ97db0-IiPG-BaJ9BcgViawEVkcBpfbpxL8EoAvSZnzwnFLtLp8JRM861L0RHIE43yg__TaF565kFrm3n4fEYRCxfAo4EZ6jrRhGI7MHZRJZKl8wRz8epJquA0OthDFALNYFT2HIvVK3plDM_OnKWJo4BuOefNjGmRYycQ0xCqih2NPzOtSxhFpef0SfBBFP-5FePiZ6XVOBRny9l"/>
</div>
<button class="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#798777]/60 hover:text-[#A2B29F] hover:bg-white transition-all shadow-sm">
<span class="material-symbols-outlined text-[18px]">favorite</span>
</button>
<div class="p-4 bg-white">
<h4 class="text-sm font-medium text-[#798777] leading-tight group-hover:text-[#A2B29F] transition-colors">ピュアリネンタオル</h4>
<p class="text-sm font-bold text-[#798777] mt-1">¥2,640</p>
</div>
</div>
</div>
</div>
<div class="py-12 flex justify-center w-full opacity-60">
<div class="flex gap-2">
<span class="size-2 rounded-full bg-[#798777]/30"></span>
<span class="size-2 rounded-full bg-[#798777]/30"></span>
<span class="size-2 rounded-full bg-[#798777]/30"></span>
</div>
</div>
</main>
<nav class="fixed bottom-0 z-50 w-full bg-[#F8EDE3] border-t border-[#A2B29F]/20 pb-safe pt-2 shadow-[0_-5px_20px_rgba(121,135,119,0.05)]">
<div class="flex justify-around items-center h-16 px-2">
<button class="flex flex-col items-center justify-center gap-1 w-16 text-[#A2B29F] group">
<div class="bg-[#A2B29F]/10 p-1.5 rounded-full group-hover:bg-[#A2B29F] group-hover:text-[#F8EDE3] transition-colors">
<span class="material-symbols-outlined filled text-[22px]">home</span>
</div>
<span class="text-[10px] font-medium">ホーム</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 w-16 text-[#798777]/60 hover:text-[#798777] transition-colors group">
<span class="material-symbols-outlined text-[24px]">search</span>
<span class="text-[10px] font-medium">さがす</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 w-16 text-[#798777]/60 hover:text-[#798777] transition-colors group">
<span class="material-symbols-outlined text-[24px]">favorite</span>
<span class="text-[10px] font-medium">お気に入り</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 w-16 text-[#798777]/60 hover:text-[#798777] transition-colors group">
<span class="material-symbols-outlined text-[24px]">person</span>
<span class="text-[10px] font-medium">マイページ</span>
</button>
</div>
<div class="h-4 w-full bg-transparent"></div>
</nav>
</body></html>


・商品詳細ページ

<!DOCTYPE html>
<html class="dark" lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>商品詳細 - My10</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "natural-bg": "#F8EDE3",
                        "natural-soft": "#BDD2B6",
                        "natural-mid": "#A2B29F",
                        "natural-dark": "#798777",
                        "background-light": "#FDFDFD",
                        "background-dark": "#0F0F11",
                        "surface-dark": "#1E1E24",
                        "surface-light": "#FFFFFF",
                    },
                    fontFamily: {
                        "display": ["Space Grotesk", "Noto Sans JP", "sans-serif"],
                        "body": ["Manrope", "Noto Sans JP", "sans-serif"]
                    },
                    boxShadow: {
                        "natural": "4px 4px 0px 0px #798777",
                        "natural-sm": "2px 2px 0px 0px #A2B29F",
                    }
                },
            },
        }
    </script>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-[#F8EDE3] dark:bg-black font-body antialiased min-h-screen flex flex-col items-center justify-center">
<div class="w-full max-w-md h-screen relative flex flex-col bg-[#F8EDE3] dark:bg-zinc-900 overflow-hidden shadow-2xl">
<div class="flex-1 overflow-y-auto no-scrollbar pb-24">
<div class="relative w-full aspect-[4/5] bg-gray-200 dark:bg-gray-800 border-b-0">
<div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-12">
<button class="flex items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm text-[#798777] hover:bg-white transition-transform active:scale-95 shadow-sm">
<span class="material-symbols-outlined font-bold">arrow_back</span>
</button>
<button class="flex items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm text-[#798777] hover:bg-white transition-transform active:scale-95 shadow-sm">
<span class="material-symbols-outlined font-bold">share</span>
</button>
</div>
<div class="w-full h-full bg-cover bg-center rounded-bl-[40px]" data-alt="Elegant herbal tea set with dried flowers and glass teapot" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAvkFMN_CQ-hSCEUY4UL3tHJ2aZ77FenyNmnYa8-QYFwDLxqElAm6OEYKwqpOALLyqCqxN8qRybg6ouu8Zl9mLQeLO5_c7LZ4uvMVzXhq_mTkq-12HN4BpLQPg5kYN0_pQJBAx4-6uU_npBUi4cDQx0MnzlxeJXVjzEpaKsA7MIGEiCiDEp9Q-XFHoiyzoQU7lp5Tm9ClvWljeWaSLmF7M0TJ5AW4egqf-MPNJdbsrkDdzoWhjPWCZllT1gon3A3da0iQpEXDqAV18a');">
</div>
<div class="absolute -bottom-6 right-6 bg-[#F8EDE3] text-[#798777] px-6 py-3 rounded-2xl shadow-lg z-20">
<p class="text-2xl font-bold font-display tracking-tight text-[#798777]">¥3,500</p>
</div>
</div>
<div class="px-6 pt-10 pb-4">
<div class="flex gap-3 mb-4 flex-wrap">
<span class="px-3 py-1 text-xs font-bold tracking-wider text-[#F8EDE3] uppercase bg-[#798777] rounded-full">オーガニック</span>
<span class="px-3 py-1 text-xs font-bold tracking-wider text-[#798777] uppercase bg-[#F8EDE3] border border-[#798777] rounded-full">カフェインレス</span>
</div>
<h1 class="text-3xl font-bold text-[#798777] dark:text-natural-soft leading-tight mb-2 font-display tracking-tight">
                    オーガニック <br/><span class="text-[#798777]">ハーブティー</span> セット
                </h1>
<p class="text-sm font-semibold text-[#798777]/80 dark:text-gray-400 mt-2">3サイズ展開 • ¥3,500 - ¥5,000</p>
</div>
<div class="px-6 py-4">
<div class="relative">
<div class="bg-[#BDD2B6] dark:bg-natural-dark/50 p-6 rounded-2xl relative z-10">
<div class="flex justify-between items-start mb-3">
<h3 class="text-xs font-bold bg-white/40 dark:bg-white/10 text-[#798777] dark:text-white px-3 py-1 rounded-full uppercase tracking-widest inline-block">オーナーのこだわり</h3>
<span class="material-symbols-outlined text-[#798777] dark:text-white/60 text-3xl">format_quote</span>
</div>
<p class="text-[#798777] dark:text-white text-base font-medium leading-relaxed font-body">
                            "このティーセットで私の夜のルーティンが変わりました！カモミールブレンドは長い一日の後に心を落ち着かせてくれます。日曜日のリラックスタイムには欠かせません。"
                        </p>
</div>
<div class="flex items-center gap-3 mt-4 ml-2">
<div class="w-12 h-12 rounded-full border-2 border-[#A2B29F] p-0.5 bg-white">
<div class="w-full h-full rounded-full bg-cover bg-center" data-alt="Portrait of the curator woman smiling" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBwGrAYOcWbz8OTHKL8cpGXGc_EtV5G5-DLD23_IWrRMjznC4NZoqOFdvFSKn7bhqOsfNS9Ckb4FaLJq9nKuSwr3wKJ8pwPWd56bQ2iaon0lm9oqOi1YOrUEVp_D7-VEbYSMo0v84yhDKytWJNGVaF6huVrf9jK8KSqcgqQIVwzHdkCQslqZaFLCSamD72qYC5M9wqAOZgdrH3JM1WDQvfEGEDisyNtnoiNc_htfIAWkQXAuddrF8K4hyKa5OmtyUTyoo0td8_HMXdS');"></div>
</div>
<div>
<span class="block text-sm font-bold text-[#798777] dark:text-natural-bg uppercase font-display">サラ・M</span>
<span class="text-xs font-medium text-[#798777]/70 dark:text-gray-400">キュレーター歴 2021年〜</span>
</div>
</div>
</div>
</div>
<div class="px-6 pb-8 space-y-4 mt-2">
<div class="flex items-center gap-4 p-4 border border-[#A2B29F]/30 rounded-xl bg-white/50 dark:bg-zinc-800/50">
<div class="w-10 h-10 bg-[#BDD2B6]/40 rounded-full flex items-center justify-center text-[#798777]">
<span class="material-symbols-outlined">eco</span>
</div>
<div>
<h4 class="text-sm font-bold text-[#798777] dark:text-natural-soft font-display uppercase">100% サステナブル</h4>
<p class="text-xs font-medium text-[#798777]/70 dark:text-gray-400 mt-0.5">静岡の農家から直送。</p>
</div>
</div>
<div class="flex items-center gap-4 p-4 border border-[#A2B29F]/30 rounded-xl bg-white/50 dark:bg-zinc-800/50">
<div class="w-10 h-10 bg-[#A2B29F]/20 rounded-full flex items-center justify-center text-[#798777]">
<span class="material-symbols-outlined">redeem</span>
</div>
<div>
<h4 class="text-sm font-bold text-[#798777] dark:text-natural-soft font-display uppercase">ギフトラッピング</h4>
<p class="text-xs font-medium text-[#798777]/70 dark:text-gray-400 mt-0.5">環境に優しい風呂敷もご用意。</p>
</div>
</div>
</div>
<div class="h-8"></div>
</div>
<div class="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-[#F8EDE3] dark:bg-zinc-900 border-t border-[#A2B29F]/20 z-50">
<div class="flex items-center gap-3 max-w-md mx-auto">
<button aria-label="保存" class="flex items-center justify-center w-16 h-14 rounded-full bg-white dark:bg-zinc-800 text-[#798777] dark:text-white border border-[#A2B29F] hover:bg-[#F8EDE3] transition-all active:scale-95 group relative">
<span class="material-symbols-outlined">favorite_border</span>
</button>
<button class="flex-1 h-14 bg-[#A2B29F] hover:bg-[#798777] text-[#F8EDE3] font-bold font-display text-lg tracking-wide rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
<span>ショップで見る</span>
<span class="material-symbols-outlined text-[20px]">open_in_new</span>
</button>
</div>
</div>
</div>
</body></html>


・ログイン

<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ログイン (日本語版)</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&amp;family=Manrope:wght@400;600;800&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "natural-bg": "#F8EDE3",
                        "natural-primary": "#A2B29F",
                        "natural-text": "#798777",
                        "natural-dark": "#4A5848", // A darker shade for contrast if needed, derived from text
                        "natural-light": "#BDD2B6", // Lighter green for accents
                        "white": "#FFFFFF",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"],
                        "fun": ["Fredoka", "sans-serif"],
                        "jp": ["Noto Sans JP", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "1rem", "2xl": "1.5rem", "3xl": "2rem", "full": "9999px"},
                    boxShadow: {
                        'soft': '0 10px 40px -10px rgba(121, 135, 119, 0.15)',
                        'soft-sm': '0 4px 10px -2px rgba(121, 135, 119, 0.1)',
                    }
                },
            },
        }
    </script>
<style>
        body {
            min-height: max(884px, 100dvh);
            background-color: #F8EDE3;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-jp min-h-screen flex flex-col items-center justify-center p-6 antialiased text-natural-text bg-natural-bg">
<div class="w-full max-w-[380px] flex flex-col h-full justify-between sm:justify-center min-h-[calc(100vh-3rem)] sm:min-h-0 bg-white/60 backdrop-blur-md sm:bg-white p-6 sm:p-10 rounded-3xl shadow-soft border border-white/50">
<div class="flex-1 flex flex-col justify-center items-center pb-6 pt-6 sm:pt-0">
<div class="w-20 h-20 bg-natural-bg rounded-full flex items-center justify-center mb-6">
<span class="material-symbols-outlined text-natural-primary text-4xl">
                    spa
                </span>
</div>
<h1 class="text-3xl font-extrabold text-natural-dark tracking-tight mb-2 font-display">
                My10
            </h1>
<p class="text-natural-text/80 text-center text-lg font-medium leading-relaxed max-w-[260px]">
                あなただけの癒やしの空間へ<br/>ようこそ
            </p>
</div>
<div class="w-full space-y-5 mb-6">
<div class="space-y-2">
<label class="text-sm font-bold uppercase tracking-wider text-natural-text ml-1" for="email">メールアドレス</label>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-natural-text/40 group-focus-within:text-natural-primary transition-colors">
                            mail
                        </span>
</div>
<input class="block w-full pl-11 pr-4 py-4 bg-white border border-natural-text/20 rounded-2xl text-natural-dark placeholder-natural-text/30 focus:outline-none focus:border-natural-primary focus:ring-1 focus:ring-natural-primary transition-all text-lg font-medium shadow-sm focus:shadow-soft-sm" id="email" placeholder="hello@example.com" type="email"/>
</div>
</div>
<div class="space-y-2">
<div class="flex justify-between items-center ml-1">
<label class="text-sm font-bold uppercase tracking-wider text-natural-text" for="password">パスワード</label>
<a class="text-sm font-bold text-natural-primary hover:text-natural-dark transition-colors" href="#">お忘れですか？</a>
</div>
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-natural-text/40 group-focus-within:text-natural-primary transition-colors">
                            lock
                        </span>
</div>
<input class="block w-full pl-11 pr-12 py-4 bg-white border border-natural-text/20 rounded-2xl text-natural-dark placeholder-natural-text/30 focus:outline-none focus:border-natural-primary focus:ring-1 focus:ring-natural-primary transition-all text-lg font-medium shadow-sm focus:shadow-soft-sm" id="password" placeholder="••••••••" type="password"/>
<button class="absolute inset-y-0 right-0 pr-4 flex items-center text-natural-text/40 hover:text-natural-primary focus:outline-none transition-colors" type="button">
<span class="material-symbols-outlined text-[24px]">
                            visibility_off
                        </span>
</button>
</div>
</div>
<button class="w-full bg-natural-primary text-white text-lg font-bold py-4 rounded-2xl shadow-sm hover:bg-natural-primary/90 hover:shadow-md transition-all flex items-center justify-center gap-2 mt-4 group">
<span>ログイン</span>
<span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                </span>
</button>
<div class="relative py-3">
<div class="absolute inset-0 flex items-center">
<div class="w-full border-t border-natural-text/10"></div>
</div>
<div class="relative flex justify-center text-sm">
<span class="px-4 bg-white/0 backdrop-blur-md sm:bg-white text-natural-text/60 font-medium">または</span>
</div>
</div>
<button class="w-full bg-white border border-natural-text/10 hover:border-natural-primary/30 hover:bg-natural-bg/30 text-natural-text font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
<svg class="w-6 h-6 opacity-80 grayscale hover:grayscale-0 transition-all" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
</svg>
                Googleで続行
            </button>
</div>
<div class="text-center pb-4">
<p class="text-natural-text/80 font-medium">
                初めてですか？
                <a class="font-bold text-natural-primary hover:text-natural-dark transition-colors ml-1" href="#">新規登録</a>
</p>
</div>
</div>

</body></html>


・新規登録ページ

<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>新規登録 (日本語版)</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<style type="text/tailwindcss">
        :root {
            --background-warm: #F8EDE3;
            --accent-sage: #A2B29F;
            --text-dark: #4A4A4A;
            --card-white: #FFFFFF;
            --accent-coral: #E68369;
        }
        .font-sans-jp {
            font-family: 'Poppins', 'Noto Sans JP', sans-serif;
        }
    </style>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        bgwarm: 'var(--background-warm)',
                        sage: 'var(--accent-sage)',
                        dark: 'var(--text-dark)',
                        surface: 'var(--card-white)',
                        coral: 'var(--accent-coral)',
                    },
                    boxShadow: {
                        'soft': '0 4px 20px -2px rgba(162, 178, 159, 0.15)',
                    },
                    borderRadius: {
                        '3xl': '1.5rem',
                    }
                }
            }
        }
    </script>
<style>
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-bgwarm font-sans-jp antialiased text-dark">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-bgwarm shadow-2xl p-6">
<header class="pt-8 pb-8 flex items-center justify-between">
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-sage transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<div class="flex items-center gap-1">
<span class="text-2xl font-extrabold tracking-tight text-sage">My10</span>
<div class="h-1.5 w-1.5 rounded-full bg-coral mt-1.5"></div>
</div>
<div class="w-10"></div>
</header>
<main class="flex-1 flex flex-col justify-center">
<div class="mb-8 text-center">
<h1 class="text-2xl font-bold text-dark mb-2">新規アカウント作成</h1>
<p class="text-sm text-dark/60">必要事項を入力して、My10をはじめましょう。</p>
</div>
<form class="flex flex-col gap-5">
<div class="space-y-1.5">
<label class="text-sm font-bold text-dark ml-1" for="username">ユーザー名</label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-sage text-[20px]">person</span>
</div>
<input class="block w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl text-dark ring-1 ring-sage/20 focus:ring-2 focus:ring-sage placeholder:text-dark/30 text-sm font-medium transition-all shadow-sm" id="username" placeholder="my10_user" type="text"/>
</div>
</div>
<div class="space-y-1.5">
<label class="text-sm font-bold text-dark ml-1" for="email">メールアドレス</label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-sage text-[20px]">mail</span>
</div>
<input class="block w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl text-dark ring-1 ring-sage/20 focus:ring-2 focus:ring-sage placeholder:text-dark/30 text-sm font-medium transition-all shadow-sm" id="email" placeholder="hello@example.com" type="email"/>
</div>
</div>
<div class="space-y-1.5">
<label class="text-sm font-bold text-dark ml-1" for="password">パスワード</label>
<div class="relative">
<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-sage text-[20px]">lock</span>
</div>
<input class="block w-full pl-11 pr-12 py-3.5 bg-white border-0 rounded-2xl text-dark ring-1 ring-sage/20 focus:ring-2 focus:ring-sage placeholder:text-dark/30 text-sm font-medium transition-all shadow-sm" id="password" placeholder="••••••••" type="password"/>
<div class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-dark/40 hover:text-sage transition-colors">
<span class="material-symbols-outlined text-[20px]">visibility_off</span>
</div>
</div>
</div>
<div class="flex items-center gap-2 mt-2 ml-1">
<input class="w-4 h-4 text-sage bg-white border-sage/30 rounded focus:ring-sage focus:ring-offset-0" id="terms" type="checkbox"/>
<label class="text-xs text-dark/70" for="terms">
<a class="text-sage font-bold underline decoration-sage/50 underline-offset-2" href="#">利用規約</a> と <a class="text-sage font-bold underline decoration-sage/50 underline-offset-2" href="#">プライバシーポリシー</a> に同意します
                    </label>
</div>
<button class="mt-4 w-full bg-sage text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-4px_rgba(162,178,159,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(162,178,159,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2" type="button">
                    新規登録
                    <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</form>
<div class="mt-8 mb-6 relative">
<div class="absolute inset-0 flex items-center">
<div class="w-full border-t border-sage/20"></div>
</div>
<div class="relative flex justify-center text-xs">
<span class="px-4 bg-bgwarm text-dark/50 font-medium">または</span>
</div>
</div>
<div class="flex gap-4 justify-center">
<button class="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-sage/20">
<img alt="Google" class="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE3Fm_5cih5nxGUI87pcBw_mWPvi1yysYMSKJ8VwGWI_8Ub58ZkkyD6yi2vv2WYAJaeXrwlr1ccZBUJeNonPKfpALtylE_6NxfbZ-v4LdBYvpMu1hrkezj6obKxnLAsUic_Ovoo91XcdiAPntavjuAbEYJwYoKpTMcleMMNlZN8L4wE0_WN3dyEol0pUvt7YKBC1UP07sZe_-eoU8SZ4zNUBHPY11kQt8JjvouhKxNSGDN3JJ3G-WAqrVYlzOpxKqs-kMLTljSkaqK"/>
</button>
<button class="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-sage/20">
<img alt="Apple" class="w-6 h-6 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd5H6doZzMXQ_JVfPhoGMLYP0XJHYiPGKqny93tfSQSdN3-MifAR2h1apA6NdHge95R_mQsl2FT5fC38BBBS93FJj__wBOvj00hZCb--L7jKOBMZvCJ9hry_PPz4t24lyBleyfI8qiAsyu7MUrT0SuZtgnjhNf016MewFNiRwypqVNShCvF5ewrDLNfFn_5n04w7Ymyo10uHNTyHLd_5ZmShJNeJOw2qFb1rBOjdVD-ftTf07ZXECW8RTLMjrECIWNq4NeCnKtbLdf"/>
</button>
<button class="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-sage/20">
<img alt="Facebook" class="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATd_IR01Z_J6lhhAymP9yQsoFphIIAWN5AFAO_EnZccx2yQYk2iE0dGl_IxHjs5CcKxI1FcTu5G2dL98Pfl1sKIrU0Q2bEJw9MvkkWVPXnw-dBhwKVKYRDRYKx3HvN19fHXmxc-HseHKe0C2HQ4lR_XWp6MKsaRvu5ryeWWHeFVicLCMGp9boLqxpz_4myOF-BAT_uIQnY2ktMnt6UcXjGVI2-_sjNBlQ81WyH8oJWt_BI_Xbs9yCcU-CLDO3WynAD_4tuAJCCgmjf"/>
</button>
</div>
</main>
<footer class="py-8 text-center">
<p class="text-sm text-dark/60">
                すでにアカウントをお持ちですか？
                <a class="text-sage font-bold hover:text-sage/80 transition-colors ml-1" href="#">ログイン</a>
</p>
</footer>
</div>

</body></html>


・マイページ

<!DOCTYPE html>
<html class="light" lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>マイページ (日本語版・ライトテーマ)</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#A2B29F",
                        "secondary": "#798777",
                        "accent": "#BDD2B6",
                        "background-light": "#F8EDE3",
                        "background-dark": "#1C1C1E",
                        "surface-light": "#FFFFFF",
                        "surface-dark": "#2C2C2E",
                        "text-main": "#5C665A",
                    },
                    fontFamily: {
                        "display": ["Manrope", "Noto Sans JP", "sans-serif"],
                        "sans": ["Manrope", "Noto Sans JP", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
                        "2xl": "2rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        "soft": "0 2px 8px 0 rgba(121, 135, 119, 0.05)",
                        "soft-hover": "0 4px 12px 0 rgba(121, 135, 119, 0.1)",
                    }
                },
            },
        }
    </script>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
            background-color: #F8EDE3;
        }
        .tab-indicator {
            position: relative;
            color: #798777;}
        .tab-indicator::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 3px;
            background-color: #A2B29F;border-radius: 99px;
            transition: all 0.3s ease;
        }
        .tab-indicator-inactive {
             color: #9CA3AF;
        }
        .tab-indicator-inactive::after {
            width: 0;
            background-color: transparent;
        }.shop-card-compact {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.75rem;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-[#F8EDE3] font-display text-[#798777] min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
<header class="sticky top-0 z-50 bg-[#F8EDE3]/95 backdrop-blur-md border-b border-[#798777]/10">
<div class="flex items-center justify-between px-5 py-4">
<h1 class="text-xl font-extrabold tracking-tight text-[#798777]">マイページ</h1>
<button aria-label="通知" class="relative p-2 rounded-full bg-white/50 shadow-sm hover:bg-white transition-all active:scale-95 text-[#798777]">
<span class="material-symbols-outlined" style="font-size: 24px;">notifications</span>
<span class="absolute top-2 right-2 flex h-2.5 w-2.5">
<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A2B29F] border-2 border-white"></span>
</span>
</button>
</div>
<div class="flex px-2">
<button class="flex-1 pb-3 text-center font-bold text-sm transition-all tab-indicator">
                フォロー中のショップ
            </button>
<button class="flex-1 pb-3 text-center font-medium text-sm hover:text-[#798777] transition-colors tab-indicator-inactive">
                保存した商品
            </button>
</div>
</header>
<main class="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
<div class="bg-white rounded-xl p-3 shadow-soft hover:shadow-soft-hover transition-shadow border border-[#798777]/5">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
<img alt="Urban Chic logo placeholder" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqy76_g4fGmV-jV4p0kYZH_h6qcelmz7H-VBYvY6DFR0wIEZeIPmpTzfEnoCXtxPRFbi4U7vBxnvADg1DrIFC-UI741-AC4z7H61qbWTobPat-FH1sNwPLKHHs4Y2U_t2S210y4EtWxLWQCxYkPxF2-xA1bLZUKmjVDx-ux6Kzy85CFzj_C1XK5m4gChDsJYjYmjzaYzfKks_uW-BK5mHu2LAgR-MO7pNZFBEpj8Wwqs-NA6Hpe0AGbgJa2pV-agmehM0eij5FAefV"/>
</div>
<div>
<h3 class="font-bold text-sm leading-tight text-[#798777]">アーバン・シック</h3>
<p class="text-[10px] text-gray-400">ミニマリスト • 2時間前</p>
</div>
</div>
<button class="h-7 px-3 rounded-full bg-[#BDD2B6]/20 text-[10px] font-bold text-[#798777] border border-[#798777]/10">
                    フォロー中
                </button>
</div>
<div class="grid grid-cols-3 gap-2">
<div class="aspect-square rounded-lg overflow-hidden relative bg-gray-50">
<img alt="Product" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoXlwBeME7jTSzgnJCfwQgwgKVBm16xLdQoTPa_a2yDsljyxCcQ6fviLuiBfCrFs1OdFgcw-1q2dyofL83Ze7XdXfqoU_PPmDIxXZvvvivUHpcMecZSjOSgxo8qaghit_qhL-PePUGlanCP4ZnQ4zPN0eKbjESnJp0qysMJBU81Li91fbk7EILX4MO1UYzwtmtr8jD8AKXXObLWfGj3tocpje6b3B7tX3TNmBDJlmehARKyRNyOyGAw9ItsWMQxYMsSVu6_OoLTkWD"/>
</div>
<div class="aspect-square rounded-lg overflow-hidden relative bg-gray-50">
<img alt="Product" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE0dICRQY6zwMvFJFHJbaUdbJfl29WWUQ54WjOII2PGqfobi9Uwr-Gf06SUjg25YmcVu2nzDswVYYgBpxCCA8JLbzxo--irZS73L8Ca8gmr2R-R96t6PJMnWDUn8KeppGmcHXvFPMRtoYNtOSXvdBJxn9k6QCroiJnaO0qAiWzcZzU4lYcU1QTCjEMAmfChJ6BmvIlnFc_FehgRFnlCQHuDxHtva3Q7KV6FV-urjHGHYFXc8-SnBu6O_UhREe-ZDLZGS2ZYDKHeBpH"/>
</div>
<div class="aspect-square rounded-lg overflow-hidden relative bg-gray-50">
<img alt="Product" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuC5T7lQPQhosGjlMIfLau6asSUdEcUMf-L66V8qeEzsP71sPQPsU_v9Y1AJwpxDkM7sJyNFJQJPm6HbNJsF8f-Jf66POyPKSIEzj3T2tdAlPZDOzdERGPLTwkAfQ1NrDVrxAzez3lY5hPCcifZobAW7LzJBaI93KUOuseq27P1iADZnvSvZvmCtB-lAcAA092Yo9p4CqsbbcD3PkuiJGHL991SwxlXiF6d9wU41VwRdpngJutYdeshTUj2peg35kXWHXzUIYshHk_"/>
<div class="absolute inset-0 bg-[#798777]/80 flex items-center justify-center">
<span class="text-white text-[10px] font-bold">+12</span>
</div>
</div>
</div>
</div>
<div class="bg-white rounded-xl p-3 shadow-soft hover:shadow-soft-hover transition-shadow border border-[#798777]/5">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 ring-1 ring-[#BDD2B6] ring-offset-2 ring-offset-white">
<img alt="Daily M logo placeholder" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBATFdemY_W_Jay9JuBl-baUW6BTFLqBhmh38SZ0d83FFaSdQkKuRsXXG8KYOwqGSFbSStMjnqp9HjUi6mcJolqt1wwie-uyLLFRtWb-mNJHRqwrCc-UdlKnsWnExWlhARvVtF2aKhpWJ2597GtZPqhXxXOsu6yIqTloNydEWUi1h_GawcjoIDyAu7StiY7HkbuJrQPRdX_VusCtbdntYAFymyPU8AtWqSdXd78DnwV5sUqUh4yKmnvtXkByIFrWcc-93U4Jjlw6Qo0"/>
</div>
<div>
<h3 class="font-bold text-sm leading-tight text-[#798777]">Daily M.</h3>
<p class="text-[10px] text-gray-400">カジュアル • 新着アイテム</p>
</div>
</div>
<button class="h-7 px-4 rounded-full bg-[#A2B29F] text-white text-[10px] font-bold hover:bg-[#A2B29F]/90 transition-colors shadow-sm">
                    フォローする
                </button>
</div>
<div class="grid grid-cols-3 gap-2">
<div class="group relative">
<div class="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-50">
<img alt="Product" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBog8aW7vD5E6UXn-y4FhqYYsSVVm0ilVrXqRtgC3ARspN-jz-qduoywRMc1CWHGm-5f1szRgV8_Vbc2amsmn0X5wFHhHl_g-BvbJukiNtePcau-357PK60bejp3ZDQtlOWDxBykZzObc-ZULA-Ob8hBdCby0q37P6kz8BdQrWzJKcAHCHNhyIwSUHlx00q79keiny4hV8yp91SGaUjtfnWFapPfr7u8kkOqreBTo0fR-D9totDwH63QaARvZKz8to4yX27ERRCBaQV"/>
<div class="absolute top-1 left-1 bg-[#BDD2B6] text-[#798777] text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">NEW</div>
</div>
<p class="text-[10px] mt-1 font-bold text-[#798777] truncate text-center">ニット</p>
</div>
<div class="group relative">
<div class="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-50">
<img alt="Product" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChXDATI-sNlRi_SwJRRL5dqeTzYTrXUylkdtWapgNmbC80JV4Ahb---s3ZDLY0uIiSvmqVJeOII08W8hfHRotlRQLLDEXnmCz_Eam8ZDEfps-2jpjWYrhlEeDBCcWe70JxyqdqZi2tO_TRhxoJSygstQU4pYVwjtM5wvoGtBn_YKLMVR-qc4RYkUkXP_UhYn1V7B0Q4MD07cFs7KfKJs78jhezRb7nTskSK1O2jdG7UrHElUiyh1IcuV_21alEXBO_z9sCs_nNOAo2"/>
</div>
<p class="text-[10px] mt-1 font-bold text-[#798777] truncate text-center">リネン</p>
</div>
<div class="group relative">
<div class="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-50">
<img alt="Product" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAysASBxqomxq2GuM8fxHyEiavL_qm_0NfbpuhNS2HyBl0hsZ5Tx94J2jnhUWQ3VNmgamqwfK7N5Q049Ce-qnPxcw2-OOxEAFTR9coOc25GrdJrS2COoP9_Of5B5t5FCCPN3ldgnLP8MK8mIqbddTMs8kaaNMCr_dY3K-UwTsLDSKoJsD6EhTsp_Ovvr2bqBnckt2UVoxsVmc96IPqDI2ut9FlD3HIdejJEZalMdOTYrhATT0_kQCqukPHalo4Nl6ZdYqrEBkeSbUR5"/>
</div>
<p class="text-[10px] mt-1 font-bold text-[#798777] truncate text-center">トート</p>
</div>
</div>
</div>
<div class="bg-white rounded-xl p-3 shadow-soft hover:shadow-soft-hover transition-shadow border border-[#798777]/5">
<div class="flex items-center justify-between mb-3">
<div class="flex items-center gap-3">
<div class="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
<img alt="Studio 40 logo placeholder" class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAreBwAXiw5Ym3Bn0FNEuYWnMeXpCL2cedwDSA_ir4wKIm9ca7sjReuLgkA9A2cHwMJq1NLnG63g0bbcfr4eYQ8JiLQc1GyLcuOWvzfGibLSRBzcmTKrLa9fMxbRZYg9gtMT-t78LgRt4qtV0NQbmD9mWZ4BL0LNBtRTqIg5Kv50mrjnIpT4PwNe0lKHV_139m_jdl4ucayaBMsCJtN23Y9OONl5lmGy6mGQnIf9pPm3VFCW_3PgA2dYsuRUEMB_KaWugNf168v5xo4"/>
</div>
<div>
<h3 class="font-bold text-sm leading-tight text-[#798777]">Studio 40</h3>
<p class="text-[10px] text-gray-400">アクセサリー</p>
</div>
</div>
<button class="h-7 px-3 rounded-full bg-[#BDD2B6]/20 text-[10px] font-bold text-[#798777] border border-[#798777]/10">
                    フォロー中
                </button>
</div>
<div class="rounded-lg overflow-hidden relative aspect-[21/9] group cursor-pointer shadow-sm">
<img alt="Woman shopping in modern boutique" class="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZhMT7Aw0WNVGx1d8581qmqgpCZvHzweBLpB92Wj98IWyi3TkG7hVoXFJBYDobZzGGi2u8SwmjJDyiAg5bJMaFOrJec5FoFHl8xewUgLnQGIIbjvzuTLCDL5g4R0Zmp6DsqYcxzyALc5-ECZQikE7RLwULBI7JqFu3kcjXz5fvMq2N4asyBS7qIa6LbFo547eA5H6Fx0Hyy2dnQjJIH-Rz_N0k_PY3ThDEgAs92bajDKyAYr3g7Zis9MF5ALD1M7hXvRhEfIhWASmN"/>
<div class="absolute inset-0 bg-gradient-to-r from-[#798777]/90 to-transparent flex flex-col justify-center px-4">
<div class="bg-[#BDD2B6]/90 text-[#798777] text-[9px] font-bold px-2 py-0.5 rounded-sm w-max mb-1">
                        FINAL SALE
                    </div>
<p class="text-white font-bold text-lg leading-tight">最大50% OFF</p>
<p class="text-white/90 text-[10px] mt-0.5">レザーグッズ限定</p>
</div>
</div>
</div>
<div class="h-8"></div>
</main>
<nav class="fixed bottom-0 left-0 w-full bg-[#F8EDE3] border-t border-[#798777]/10 pb-safe pt-2 px-2 z-40 rounded-t-2xl shadow-[0_-4px_16px_rgba(121,135,119,0.08)]" style="padding-bottom: env(safe-area-inset-bottom);">
<div class="flex justify-around items-center h-16">
<a class="flex flex-col items-center justify-center gap-1 w-full text-gray-400 hover:text-[#A2B29F] transition-colors group" href="#">
<span class="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">home</span>
<span class="text-[10px] font-medium">ホーム</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 w-full text-gray-400 hover:text-[#A2B29F] transition-colors group" href="#">
<span class="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">search</span>
<span class="text-[10px] font-medium">さがす</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 w-full text-gray-400 hover:text-[#A2B29F] transition-colors group" href="#">
<span class="material-symbols-outlined text-[24px] group-hover:scale-105 transition-transform">favorite</span>
<span class="text-[10px] font-medium">お気に入り</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 w-full text-[#A2B29F] transition-colors relative" href="#">
<span class="absolute -top-3 w-8 h-1 bg-[#A2B29F] rounded-full"></span>
<span class="material-symbols-outlined text-[24px] fill-current" style="font-variation-settings: 'FILL' 1;">person</span>
<span class="text-[10px] font-medium text-[#798777]">マイページ</span>
</a>
</div>
</nav>
<div class="h-[env(safe-area-inset-bottom)] bg-[#F8EDE3]"></div>
</body></html>


・プロフィール編集ページ

<!DOCTYPE html>
<html class="light" lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>プロフィール編集 - My10</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#798478",
                        "secondary": "#A2B29F",
                        "accent": "#D0E1D4",
                        "background-light": "#F8EDE3",
                        "background-dark": "#2C332B",
                        "surface-dark": "#3A4239",
                        "surface-light": "#ffffff",
                        "input-border-light": "#A2B29F",
                        "input-border-dark": "#5A6658",
                        "text-main": "#4A5049",
                        "text-muted": "#757F73"
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "1rem", "2xl": "1.5rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 4px 20px -2px rgba(162, 178, 159, 0.2)',
                        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                    }
                },
            },
        }
    </script>
<style>
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased">
<div class="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
<header class="flex items-center justify-between px-6 py-5 bg-background-light dark:bg-background-dark sticky top-0 z-20">
<button class="flex size-10 items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm hover:scale-105 transition-transform text-text-main dark:text-white border border-input-border-light/50 dark:border-input-border-dark">
<span class="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
</button>
<h1 class="text-xl font-extrabold leading-tight tracking-tight text-text-main dark:text-white">プロフィール編集</h1>
<button class="text-text-muted font-bold text-sm px-2 hover:text-primary transition-colors">キャンセル</button>
</header>
<main class="flex-1 flex flex-col gap-8 px-6 pb-32 overflow-y-auto">
<div class="flex flex-col items-center gap-4 pt-2">
<div class="relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
<div class="p-1 rounded-full border-2 border-dashed border-secondary">
<div class="size-32 rounded-full bg-surface-dark bg-center bg-cover border-4 border-[#F8EDE3] dark:border-surface-dark shadow-soft" data-alt="Portrait of a woman with a confident smile" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBH7PP8PSpYFM7iA7WSy6OxHTg0ijpEnw4deQmmvQMwT57PLB2O-T1JUxqcyEH7ZEa2mZvBYk_ipeKSwL3wg1feLPWmnFJFj2yQo3pgAnwTguClVtOmC5SJvtcnPzuUJhr12f5Zo-Ez1xqOi8O3PU-BmA_RtpG7adCdaxJfxfWSYJYtPb-6Uq88_XYF7b_bO96Dy9F0EcqCOPq_rNqAFU--hLaSf66_1IpGsU_bX8hvVA4iVQC-x1gXU2gY8GkiTwL6EwtMEq0PXc9w");'>
</div>
</div>
<div class="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2.5 shadow-lg flex items-center justify-center border-4 border-[#F8EDE3] dark:border-background-dark transform rotate-3 hover:rotate-12 transition-transform">
<span class="material-symbols-outlined text-[20px] font-bold">edit</span>
</div>
</div>
<button class="text-primary font-bold text-sm tracking-wide hover:underline decoration-2 underline-offset-4 decoration-wavy decoration-secondary/50">写真を変更</button>
</div>
<div class="flex flex-col gap-6">
<div class="flex flex-col gap-2">
<label class="text-sm font-bold text-text-muted dark:text-accent ml-2 uppercase tracking-wider text-[11px]">ユーザー名</label>
<div class="relative group">
<span class="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">@</span>
<input class="w-full bg-white dark:bg-surface-dark border-2 border-input-border-light dark:border-input-border-dark rounded-2xl px-5 pl-10 py-4 text-base font-semibold focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-text-main dark:text-white shadow-sm group-hover:border-primary/50" type="text" value="janedoe"/>
</div>
</div>
<div class="flex flex-col gap-2">
<label class="text-sm font-bold text-text-muted dark:text-accent ml-2 uppercase tracking-wider text-[11px]">表示名</label>
<input class="w-full bg-white dark:bg-surface-dark border-2 border-input-border-light dark:border-input-border-dark rounded-2xl px-5 py-4 text-base font-semibold focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-text-main dark:text-white shadow-sm hover:border-primary/50" type="text" value="Jane Doe"/>
</div>
<div class="flex flex-col gap-2">
<div class="flex justify-between items-baseline px-2">
<label class="text-sm font-bold text-text-muted dark:text-accent uppercase tracking-wider text-[11px]">自己紹介</label>
<span class="text-[10px] font-bold text-text-muted/70 bg-white dark:bg-white/5 px-2 py-0.5 rounded-full border border-secondary/20">58/150</span>
</div>
<textarea class="w-full bg-white dark:bg-surface-dark border-2 border-input-border-light dark:border-input-border-dark rounded-2xl px-5 py-4 text-base font-medium focus:outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 min-h-[110px] resize-none text-text-main dark:text-white shadow-sm hover:border-primary/50 leading-relaxed">ミニマリストファッション、サステナブルな暮らし、モダンアートが好きです。</textarea>
</div>
</div>
<div class="flex flex-col gap-3 pt-2">
<div class="flex items-center justify-between px-1">
<label class="text-sm font-bold text-text-muted dark:text-accent uppercase tracking-wider text-[11px]">興味・好み</label>
</div>
<div class="flex flex-wrap gap-3">
<button class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
<span>ワークウェア</span>
<span class="material-symbols-outlined text-[16px] bg-white/20 rounded-full p-0.5">check</span>
</button>
<button class="flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
<span>スキンケア</span>
<span class="material-symbols-outlined text-[16px] bg-white/20 rounded-full p-0.5">check</span>
</button>
<button class="group flex items-center gap-1.5 bg-white dark:bg-surface-dark border-2 border-dashed border-secondary/60 dark:border-secondary/30 text-text-muted dark:text-slate-300 px-4 py-2.5 rounded-full text-sm font-bold hover:border-primary hover:text-primary transition-all">
<span>インテリア</span>
<span class="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">add</span>
</button>
<button class="group flex items-center gap-1.5 bg-white dark:bg-surface-dark border-2 border-dashed border-secondary/60 dark:border-secondary/30 text-text-muted dark:text-slate-300 px-4 py-2.5 rounded-full text-sm font-bold hover:border-primary hover:text-primary transition-all">
<span>靴・シューズ</span>
<span class="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">add</span>
</button>
<button class="group flex items-center gap-1.5 bg-white dark:bg-surface-dark border-2 border-dashed border-secondary/60 dark:border-secondary/30 text-text-muted dark:text-slate-300 px-4 py-2.5 rounded-full text-sm font-bold hover:border-primary hover:text-primary transition-all">
<span>ジュエリー</span>
<span class="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">add</span>
</button>
</div>
</div>
<div class="mt-4 pb-4">
<button class="w-full bg-primary hover:bg-primary/90 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] active:shadow-none flex items-center justify-center gap-2">
<span>変更を保存</span>
<span class="material-symbols-outlined">auto_awesome</span>
</button>
</div>
</main>
<nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-background-dark/95 backdrop-blur-xl border-t border-secondary/20 dark:border-white/5 pb-6 pt-3 px-4 max-w-md mx-auto rounded-t-3xl">
<div class="grid grid-cols-4 items-center">
<button class="group flex flex-col items-center gap-1 cursor-pointer">
<div class="p-1 rounded-full group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-text-muted dark:text-slate-500 group-hover:text-primary transition-colors text-[28px]">home</span>
</div>
</button>
<button class="group flex flex-col items-center gap-1 cursor-pointer">
<div class="p-1 rounded-full group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-text-muted dark:text-slate-500 group-hover:text-primary transition-colors text-[28px]">search</span>
</div>
</button>
<button class="group flex flex-col items-center gap-1 cursor-pointer">
<div class="p-1 rounded-full group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-text-muted dark:text-slate-500 group-hover:text-primary transition-colors text-[28px]">favorite</span>
</div>
</button>
<button class="group flex flex-col items-center gap-1 cursor-pointer relative">
<div class="p-1 rounded-full bg-primary/10">
<span class="material-symbols-outlined text-primary text-[28px] fill-1" style="font-variation-settings: 'FILL' 1;">person</span>
</div>
<span class="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"></span>
</button>
</div>
</nav>
</div>

</body></html>


・出店者管理ページ

<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ショップ管理 - My10</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "primary": "#A2B29F",
                        "secondary": "#D7C0AE",
                        "accent": "#798777",
                        "background-light": "#F8EDE3",
                        "surface-light": "#FFFFFF",
                        "text-main": "#798777",
                        "text-body": "#798777",
                        "border-light": "#EADBC8",
                    },
                    fontFamily: {
                        "display": ["Noto Sans JP", "Manrope", "sans-serif"]
                    },
                    boxShadow: {
                        'soft': '0 4px 20px -2px rgba(162, 178, 159, 0.2)',
                        'soft-hover': '0 10px 25px -5px rgba(162, 178, 159, 0.3)',
                        'glow': '0 0 15px rgba(162, 178, 159, 0.4)',
                    },
                    borderRadius: {"DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "1rem", "2xl": "1.5rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            min-height: max(884px, 100dvh);
        }
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light font-display text-text-body min-h-screen flex flex-col overflow-x-hidden antialiased selection:bg-primary selection:text-white">
<header class="sticky top-0 z-20 flex items-center bg-background-light/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-border-light">
<button class="text-text-body flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-light shadow-sm hover:bg-white active:scale-95 transition-all">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<div class="flex flex-col items-center flex-1">
<h2 class="text-text-main text-lg font-bold leading-tight tracking-tight">My10 ブティック</h2>
<span class="text-xs font-semibold text-text-body/80 tracking-wide uppercase">クリエイタースタジオ</span>
</div>
<button class="flex items-center justify-end text-text-body font-semibold text-sm tracking-wide h-10 px-3 rounded-full hover:bg-surface-light active:bg-surface-light/80 transition-colors">
            プレビュー
        </button>
</header>
<main class="flex-1 flex flex-col pb-24 px-4">
<div class="mt-6 mb-4">
<h1 class="text-2xl font-extrabold text-text-main">こんにちは、オーナー様！ 👋</h1>
<p class="text-text-body text-sm font-medium">ショップの準備を始めましょう。</p>
</div>
<section class="flex flex-wrap gap-3 py-2">
<div class="relative overflow-hidden flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-surface-light border border-border-light p-4 items-center text-center shadow-sm hover:shadow-soft transition-all cursor-pointer group">
<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
<span class="material-symbols-outlined text-4xl text-primary">wifi</span>
</div>
<div class="flex items-center gap-1.5 mb-1 bg-[#F1F5F2] px-2 py-0.5 rounded-full border border-primary/20">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<p class="text-primary text-[10px] font-bold uppercase tracking-wider">公開中</p>
</div>
<p class="text-text-main tracking-tight text-xl font-bold leading-tight">オンライン</p>
</div>
<div class="relative overflow-hidden flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-surface-light border border-border-light p-4 items-center text-center shadow-sm hover:shadow-soft transition-all cursor-pointer group">
<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
<span class="material-symbols-outlined text-4xl text-text-body">visibility</span>
</div>
<div class="flex items-center gap-1.5 mb-1 bg-[#F1F5F2] px-2 py-0.5 rounded-full border border-border-light">
<span class="material-symbols-outlined text-text-body/70 text-xs">visibility</span>
<p class="text-text-body text-[10px] font-bold uppercase tracking-wider">閲覧数</p>
</div>
<p class="text-text-main tracking-tight text-xl font-bold leading-tight">1.2k</p>
</div>
<div class="relative overflow-hidden flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-surface-light border border-border-light p-4 items-center text-center shadow-sm hover:shadow-soft transition-all cursor-pointer group">
<div class="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
<span class="material-symbols-outlined text-4xl text-text-body">shopping_bag</span>
</div>
<div class="flex items-center gap-1.5 mb-1 bg-[#F1F5F2] px-2 py-0.5 rounded-full border border-border-light">
<span class="material-symbols-outlined text-text-body/70 text-xs">shopping_bag</span>
<p class="text-text-body text-[10px] font-bold uppercase tracking-wider">販売数</p>
</div>
<p class="text-text-main tracking-tight text-xl font-bold leading-tight">145</p>
</div>
</section>
<section class="flex justify-center mb-6 mt-2">
<div class="flex flex-1 gap-3 w-full">
<button class="flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-14 px-4 bg-surface-light text-text-body border border-border-light text-sm font-bold leading-normal tracking-wide active:scale-[0.98] transition-all hover:bg-white shadow-sm">
<span class="truncate">ショップ情報を編集</span>
</button>
<button class="flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl h-14 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide active:scale-[0.98] transition-all shadow-soft hover:shadow-soft-hover hover:brightness-105">
<span class="material-symbols-outlined text-xl">add_circle</span>
<span class="truncate">商品を追加</span>
</button>
</div>
</section>
<section class="pb-4 flex items-end justify-between">
<div>
<h3 class="text-text-main tracking-tight text-2xl font-bold leading-tight flex items-center gap-2">
                    My Top 10 <span class="text-xl opacity-80">🌿</span>
</h3>
<p class="text-text-body text-xs font-semibold mt-1 uppercase tracking-wide opacity-80">ドラッグして並べ替え</p>
</div>
<div class="bg-secondary text-white px-3 py-1.5 rounded-full shadow-sm">
<p class="text-xs font-bold">7 / 10 使用中</p>
</div>
</section>
<section class="flex flex-col gap-3">
<div class="group relative flex items-center gap-4 bg-surface-light p-3 pr-4 rounded-2xl border border-primary/30 shadow-soft scale-[1.01] z-10">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-50 border border-gray-100" data-alt="Navy blue silk blouse folded neatly" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCb2fZs3_8wJoKeZ9Gh4X6Qr_1UXtQ9_1OslqdVHNrGvt7jdmlnwgBNIynHFY6aomUOQsSJ-621O8UjVOtaxyja6dzs1W2fgpKSY61jmlAZR25pug7Fp7hQtMHih0UIOUYuxHV7dKMYxDZDw8DG8kjy1OodMW_gntu1iN5yrpog0NEOBFVzIUdjHSLNWTQ3j3xlUAYwu8-urxCGJJekWxWCHvSwMezokWkS6rY_ZcKRLLARL0UwC67_7u14EQxsvjSvQA5b3IRsXlkq");'></div>
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-0.5">
<span class="bg-primary/20 text-text-body text-[10px] font-bold px-1.5 py-0.5 rounded">#1</span>
</div>
<p class="text-text-main text-base font-bold truncate">シルクブラウス - ネイビー</p>
<p class="text-text-body text-sm font-semibold">¥12,000</p>
</div>
<div class="shrink-0 bg-primary/20 text-text-body rounded-lg cursor-grab active:cursor-grabbing p-2 hover:bg-primary hover:text-white transition-colors">
<span class="material-symbols-outlined">drag_pan</span>
</div>
</div>
<div class="group flex items-center gap-4 bg-surface-light p-3 pr-4 rounded-2xl border border-transparent shadow-sm hover:shadow-soft transition-all">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-50 border border-gray-100" data-alt="Brown leather tote bag" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAoR7gWoD0n7FtXNDo2i4EGLXQ-u-FvlZMKb52CHknfQhq6RBnqFbpBcvEajnrAyrNiXniiS1-KabD5G3J4lOWNfz-K4T7H7zNN6L2eCgsQnXXQ5lKofSfNZm0vykKWh-hbibDCJhiY0cDUHMy5Ro4Ls5YMNNlrOssRGZanzqycSMAeprTh7yVPCb99wk5-8tCm1UctZd9L9Rmxf9O0fy7YaA9GNPiIMdZOVKrqpuG2oDVULqxrxfklfktptVdrr1X64aGlzO10sgKx");'></div>
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-0.5">
<span class="bg-[#EFEFEF] text-text-body text-[10px] font-bold px-1.5 py-0.5 rounded">#2</span>
</div>
<p class="text-text-main text-base font-bold truncate">レザートートバッグ</p>
<p class="text-text-body text-sm font-semibold">¥25,000</p>
</div>
<div class="shrink-0 text-[#C4C4C4] group-hover:text-primary cursor-grab active:cursor-grabbing p-2 transition-colors">
<span class="material-symbols-outlined">drag_indicator</span>
</div>
</div>
<div class="group flex items-center gap-4 bg-surface-light p-3 pr-4 rounded-2xl border border-transparent shadow-sm hover:shadow-soft transition-all">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-50 border border-gray-100" data-alt="Soft beige cashmere scarf texture" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuARlHzVzlcjbnSuHDVjimZnP361zGplG5wbgOn84ypTtbAVPiO88BMLcanA-exB0tOS5NiulrQlR7xHTmC5CakoQiibW2vifeLw1pQp3pv2iGPd88oRnN8d0oiYPpovFQ0xYu5DYhaN8fYxsXpTe06N0gl83DoTYx0iDcDEWagNAiQScBY7b0OqE4GDZr6y91nPJutI3OdAtcGokFXF3vurRh8yKDhVC5lFNKDzO8BrmhOleYLswf908xMUJK8CDMN13WxxSW_3rIPj");'></div>
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-0.5">
<span class="bg-[#EFEFEF] text-text-body text-[10px] font-bold px-1.5 py-0.5 rounded">#3</span>
</div>
<p class="text-text-main text-base font-bold truncate">カシミアスカーフ</p>
<p class="text-text-body text-sm font-semibold">¥8,500</p>
</div>
<div class="shrink-0 text-[#C4C4C4] group-hover:text-primary cursor-grab active:cursor-grabbing p-2 transition-colors">
<span class="material-symbols-outlined">drag_indicator</span>
</div>
</div>
<div class="group flex items-center gap-4 bg-surface-light p-3 pr-4 rounded-2xl border border-transparent shadow-sm hover:shadow-soft transition-all">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-50 border border-gray-100" data-alt="Close up of a silver wristwatch" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAbyRPODD9uqifduJ77dVVjAJWQR-PAQuUtTQ3G_VNuyMX2268dl8c1fm5yM7BcwESX1qcsjQgcoOxgBnlVB_g-9uJgRlr7ij-EedDzVJUCJfDdoPnSpX4Y1BOLLcf8g7uWWPQxVcKUzJQW1HNO-8vTDymxdJeokfZL8VrY85-Q-KHtC74Jk9IPiw_H5F550EIyGggVIDxyJq3uUXxagbyfSWqOS6AA7Y7eGHtgVh_AxAqpx10nBJBN4seMaRk57TlEJs4qpFsOfz0e");'></div>
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-0.5">
<span class="bg-[#EFEFEF] text-text-body text-[10px] font-bold px-1.5 py-0.5 rounded">#4</span>
</div>
<p class="text-text-main text-base font-bold truncate">クラシックシルバーウォッチ</p>
<p class="text-text-body text-sm font-semibold">¥19,500</p>
</div>
<div class="shrink-0 text-[#C4C4C4] group-hover:text-primary cursor-grab active:cursor-grabbing p-2 transition-colors">
<span class="material-symbols-outlined">drag_indicator</span>
</div>
</div>
<div class="group flex items-center gap-4 bg-surface-light p-3 pr-4 rounded-2xl border border-transparent shadow-sm hover:shadow-soft transition-all">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-50 border border-gray-100" data-alt="Athletic sneakers in pink and white" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBIooJd_r-eR22KYDZP1IL1ADjI7BU3OVTx9J9AXWLme93JArnMEqDknq_p0BGOE5JtV3XA_fWbaB9UU2aMPCt_YtrrkuuBwGJcR6bDOStUwh59cAtWLfIyh_AQ8xt9n-ouzSWZBRZx9FuygJDAf-mGD9sVfn12IiPwRXbNHlUk8JVg74pZuXlsPef_GLub65W7onGkNF28di6xmiwOC3nnP5hxvA_tmAXYAO5Eq0tTgdAxFbhUPUKQBcHwOjYZdVWGuvorZNcruXL3");'></div>
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-0.5">
<span class="bg-[#EFEFEF] text-text-body text-[10px] font-bold px-1.5 py-0.5 rounded">#5</span>
</div>
<p class="text-text-main text-base font-bold truncate">ウィークエンドスニーカー</p>
<p class="text-text-body text-sm font-semibold">¥8,900</p>
</div>
<div class="shrink-0 text-[#C4C4C4] group-hover:text-primary cursor-grab active:cursor-grabbing p-2 transition-colors">
<span class="material-symbols-outlined">drag_indicator</span>
</div>
</div>
<div class="group flex items-center gap-4 bg-surface-light p-3 pr-4 rounded-2xl border border-transparent shadow-sm hover:shadow-soft transition-all">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0 bg-gray-50 border border-gray-100" data-alt="Structured linen blazer in cream" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMhuYHZvFGNt3hoT3DtFEn79tgcudgFQ3uGoDWhaf94MO-zqNF4ly4QTeV-NqBJpb-00_jrkUHdMV7Zfo27dH1ZySyDr4YHd9B1EBuVCTDet-2Z3PPzwsa4CqiEaYwSipPI5ZfUYHKYWxUH3-imL1B4fRdO8o8am8eDaWDUqkgy8AadrmVagGDO4I7UwF9ZWMBXqYx4-KvSJGAPuJjmwJYiA56KVi8FGx7z6DA1rmCWmhUGKBEM685oPSBXYshAyNzcwV0KxC4HcYt");'></div>
<div class="flex-1 min-w-0">
<div class="flex items-center gap-2 mb-0.5">
<span class="bg-[#EFEFEF] text-text-body text-[10px] font-bold px-1.5 py-0.5 rounded">#6</span>
</div>
<p class="text-text-main text-base font-bold truncate">リネンブレザー</p>
<p class="text-text-body text-sm font-semibold">¥15,000</p>
</div>
<div class="shrink-0 text-[#C4C4C4] group-hover:text-primary cursor-grab active:cursor-grabbing p-2 transition-colors">
<span class="material-symbols-outlined">drag_indicator</span>
</div>
</div>
<button class="flex items-center justify-center gap-3 bg-surface-light/50 border-2 border-dashed border-border-light p-4 rounded-2xl h-24 group hover:border-primary transition-all">
<div class="flex items-center justify-center size-10 rounded-full bg-white text-text-body group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-105 shadow-sm">
<span class="material-symbols-outlined text-2xl">add</span>
</div>
<span class="text-sm font-bold text-text-body group-hover:text-primary transition-colors">枠 #8 を埋める</span>
</button>
<div class="h-8"></div>
</section>
</main>
<nav class="fixed bottom-0 z-30 w-full border-t border-border-light bg-background-light/95 backdrop-blur pb-safe rounded-t-3xl shadow-[0_-5px_15px_rgba(162,178,159,0.1)]">
<div class="flex h-20 items-center justify-around px-2">
<a class="flex flex-col items-center justify-center gap-1 w-16 group" href="#">
<div class="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-primary transition-colors">dashboard</span>
</div>
<span class="text-[10px] font-bold text-primary transition-colors">ホーム</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 w-16 group" href="#">
<div class="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-primary transition-colors">shopping_bag</span>
</div>
<span class="text-[10px] font-bold text-primary transition-colors">注文</span>
</a>
<div class="-mt-8">
<a class="flex flex-col items-center justify-center gap-1 w-16" href="#">
<div class="size-14 flex items-center justify-center rounded-full bg-primary shadow-soft hover:shadow-soft-hover border-4 border-background-light transform transition-transform active:scale-95 text-white">
<span class="material-symbols-outlined text-2xl">storefront</span>
</div>
</a>
</div>
<a class="flex flex-col items-center justify-center gap-1 w-16 group" href="#">
<div class="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-primary transition-colors">chat_bubble</span>
</div>
<span class="text-[10px] font-bold text-primary transition-colors">受信箱</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 w-16 group" href="#">
<div class="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
<span class="material-symbols-outlined text-primary transition-colors">settings</span>
</div>
<span class="text-[10px] font-bold text-primary transition-colors">設定</span>
</a>
</div>
</nav>

</body></html>