"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";

export default function ProfileHeader() {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-6 py-5 bg-bgwarm sticky top-0 z-20">
      <BackButton />
      <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main">
        プロフィール編集
      </h1>
      <button
        onClick={() => router.back()}
        className="text-text-muted font-bold text-sm px-2 hover:text-text-main transition-colors"
      >
        キャンセル
      </button>
    </header>
  );
}
