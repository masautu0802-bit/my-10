"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn, signInWithGoogle } from "@/app/actions/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    startTransition(async () => {
      const result = await signIn({ email, password });
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      const origin = window.location.origin;
      const result = await signInWithGoogle(origin);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bgwarm">
      <div className="w-full max-w-[380px] flex flex-col justify-between bg-white/60 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-soft border border-white/50">
        <div className="flex-1 flex flex-col justify-center items-center pb-6 pt-6">
          <div className="w-20 h-20 bg-bgwarm rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-sage text-4xl">
              spa
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-dark tracking-tight mb-2 font-display">
            My10
          </h1>
          <p className="text-text-main/80 text-center text-lg font-medium leading-relaxed max-w-[260px]">
            あなただけの癒やしの空間へ
            <br />
            ようこそ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5 mb-6">
          {error && (
            <div className="bg-coral/10 border border-coral/30 text-coral text-sm font-medium px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              className="text-sm font-bold uppercase tracking-wider text-text-main ml-1"
              htmlFor="email"
            >
              メールアドレス
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-main/40 group-focus-within:text-sage transition-colors">
                  mail
                </span>
              </div>
              <input
                className="block w-full pl-11 pr-4 py-4 bg-white border border-text-main/20 rounded-2xl text-dark placeholder-text-main/30 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-lg font-medium shadow-sm"
                id="email"
                name="email"
                placeholder="hello@example.com"
                type="email"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label
                className="text-sm font-bold uppercase tracking-wider text-text-main"
                htmlFor="password"
              >
                パスワード
              </label>
              <Link
                className="text-sm font-bold text-sage hover:text-dark transition-colors"
                href="#"
              >
                お忘れですか？
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-main/40 group-focus-within:text-sage transition-colors">
                  lock
                </span>
              </div>
              <input
                className="block w-full pl-11 pr-12 py-4 bg-white border border-text-main/20 rounded-2xl text-dark placeholder-text-main/30 focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition-all text-lg font-medium shadow-sm"
                id="password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                disabled={isPending}
              />
              <button
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-main/40 hover:text-sage focus:outline-none transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-sage text-white text-lg font-bold py-4 rounded-2xl shadow-sm hover:bg-sage/90 hover:shadow-md transition-all flex items-center justify-center gap-2 mt-4 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
            ) : (
              <>
                <span>ログイン</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-text-main/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/0 backdrop-blur-md text-text-main/60 font-medium">
                または
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isPending}
            className="w-full bg-white border border-text-main/10 hover:border-sage/30 hover:bg-bgwarm/30 text-text-main font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
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
            Googleで続行
          </button>
        </form>

        <div className="text-center pb-4">
          <p className="text-text-main/80 font-medium">
            初めてですか？
            <Link
              className="font-bold text-sage hover:text-dark transition-colors ml-1"
              href="/auth/signup"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
