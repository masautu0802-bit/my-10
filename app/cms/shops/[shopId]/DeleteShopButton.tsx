"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteShop } from "@/app/actions/shop";

export default function DeleteShopButton({ shopId }: { shopId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    const confirmed = window.confirm(
      "本当にこのショップを削除しますか？\nこの操作は取り消せません。"
    );

    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteShop(shopId);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/shop");
      }
    });
  };

  return (
    <div className="mt-8">
      {error && (
        <div className="bg-coral/10 border border-coral/30 text-coral text-sm font-medium px-4 py-3 rounded-2xl mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="w-full py-4 rounded-2xl bg-coral text-white font-bold text-lg shadow-lg hover:bg-coral/90 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
            削除中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">delete</span>
            ショップを削除
          </span>
        )}
      </button>
    </div>
  );
}
