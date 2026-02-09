"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 hover:bg-coral/20 text-coral font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      {isPending ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
