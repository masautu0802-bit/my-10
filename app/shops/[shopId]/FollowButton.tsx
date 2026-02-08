"use client";

import { useTransition } from "react";
import { toggleShopFollow } from "@/app/actions/shop";

export default function FollowButton({
  shopId,
  isFollowing,
}: {
  shopId: string;
  isFollowing: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleShopFollow(shopId))}
      className={`w-full max-w-[200px] font-medium text-base py-3 px-6 rounded-full shadow-soft hover:shadow-soft-hover active:translate-y-[1px] transition-all mb-8 flex items-center justify-center gap-2 disabled:opacity-60 ${
        isFollowing
          ? "bg-white text-sage border border-sage"
          : "bg-sage text-bgwarm hover:bg-text-main"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {isFollowing ? "check" : "add"}
      </span>
      {isFollowing ? "フォロー中" : "フォローする"}
    </button>
  );
}
