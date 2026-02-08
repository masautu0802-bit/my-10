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
      disabled={isPending}
      onClick={() => startTransition(() => toggleItemFavorite(itemId))}
      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-sm text-text-main/60 hover:text-sage hover:bg-white transition-all shadow-sm z-10 disabled:opacity-60"
    >
      <span
        className="material-symbols-outlined text-[18px]"
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
