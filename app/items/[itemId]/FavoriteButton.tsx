"use client";

import { useTransition } from "react";
import { toggleItemFavorite } from "@/app/actions/shop";

export default function FavoriteButton({
  itemId,
  isFavorited,
}: {
  itemId: string;
  isFavorited: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-label="保存"
      disabled={isPending}
      onClick={() => startTransition(() => toggleItemFavorite(itemId))}
      className="flex items-center justify-center w-16 h-14 rounded-full bg-white text-text-main border border-sage hover:bg-bgwarm transition-all active:scale-95 group disabled:opacity-60"
    >
      <span
        className="material-symbols-outlined"
        style={
          isFavorited
            ? { fontVariationSettings: "'FILL' 1", color: "#A2B29F" }
            : undefined
        }
      >
        favorite
      </span>
    </button>
  );
}
