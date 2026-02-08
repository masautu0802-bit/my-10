"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signUp } from "@/app/actions/auth";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const terms = formData.get("terms");

    if (!name || !email || !password) {
      setError("すべての項目を入力してください");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    if (!terms) {
      setError("利用規約に同意してください");
      return;
    }

    startTransition(async () => {
      const result = await signUp({ email, password, name });
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-bgwarm shadow-2xl p-6">
      <header className="pt-8 pb-8 flex items-center justify-between">
        <Link
          href="/auth/login"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white text-sage transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">
            arrow_back
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-sage font-display">
            My10
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-coral mt-1.5" />
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-dark mb-2">
            新規アカウント作成
          </h1>
          <p className="text-sm text-dark/60">
            必要事項を入力して、My10をはじめましょう。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-coral/10 border border-coral/30 text-coral text-sm font-medium px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              className="text-sm font-bold text-dark ml-1"
              htmlFor="username"
            >
              ユーザー名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-sage text-[20px]">
                  person
                </span>
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl text-dark ring-1 ring-sage/20 focus:ring-2 focus:ring-sage placeholder:text-dark/30 text-sm font-medium transition-all shadow-sm"
                id="username"
                name="username"
                placeholder="my10_user"
                type="text"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-bold text-dark ml-1"
              htmlFor="email"
            >
              メールアドレス
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-sage text-[20px]">
                  mail
                </span>
              </div>
              <input
                className="block w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl text-dark ring-1 ring-sage/20 focus:ring-2 focus:ring-sage placeholder:text-dark/30 text-sm font-medium transition-all shadow-sm"
                id="email"
                name="email"
                placeholder="hello@example.com"
                type="email"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-bold text-dark ml-1"
              htmlFor="password"
            >
              パスワード
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-sage text-[20px]">
                  lock
                </span>
              </div>
              <input
                className="block w-full pl-11 pr-12 py-3.5 bg-white border-0 rounded-2xl text-dark ring-1 ring-sage/20 focus:ring-2 focus:ring-sage placeholder:text-dark/30 text-sm font-medium transition-all shadow-sm"
                id="password"
                name="password"
                placeholder="••••••••（8文字以上）"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                disabled={isPending}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-dark/40 hover:text-sage transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 ml-1">
            <input
              className="w-4 h-4 text-sage bg-white border-sage/30 rounded focus:ring-sage focus:ring-offset-0"
              id="terms"
              name="terms"
              type="checkbox"
              value="agreed"
            />
            <label className="text-xs text-dark/70" htmlFor="terms">
              <Link
                className="text-sage font-bold underline decoration-sage/50 underline-offset-2"
                href="#"
              >
                利用規約
              </Link>{" "}
              と{" "}
              <Link
                className="text-sage font-bold underline decoration-sage/50 underline-offset-2"
                href="#"
              >
                プライバシーポリシー
              </Link>{" "}
              に同意します
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full bg-sage text-white font-bold py-4 rounded-2xl shadow-[0_8px_20px_-4px_rgba(162,178,159,0.5)] hover:shadow-[0_12px_24px_-6px_rgba(162,178,159,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <>
                新規登録
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sage/20" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-bgwarm text-dark/50 font-medium">
              または
            </span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button className="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center hover:-translate-y-1 transition-transform duration-300 border border-transparent hover:border-sage/20">
            <svg
              className="w-6 h-6 opacity-80"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </button>
        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-sm text-dark/60">
          すでにアカウントをお持ちですか？
          <Link
            className="text-sage font-bold hover:text-sage/80 transition-colors ml-1"
            href="/auth/login"
          >
            ログイン
          </Link>
        </p>
      </footer>
    </div>
  );
}
