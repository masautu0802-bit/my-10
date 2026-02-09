"use client";

import { useTransition } from "react";
import { toggleShopFollow } from "@/app/actions/shop";
import { getContrastTextColor } from "@/app/lib/shop-customization";

export default function FollowButton({
  shopId,
  isFollowing,
  primaryColor = "#8FBC8F",
  quaternaryColor = "#FFD6BA",
  isDark = false,
}: {
  shopId: string;
  isFollowing: boolean;
  primaryColor?: string;
  quaternaryColor?: string;
  isDark?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  // 背景色に応じた適切なテキスト色を計算
  const textOnQuaternary = getContrastTextColor(quaternaryColor);
  const textOnWhite = isDark ? "#FFFFFF" : "#2C3E50";

  const followedBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)";

  const followedStyle = {
    backgroundColor: followedBg,
    color: textOnWhite,
    border: `2px solid ${quaternaryColor}`,
  };

  const notFollowedStyle = {
    backgroundColor: quaternaryColor,
    color: textOnQuaternary,
    border: `2px solid ${quaternaryColor}`,
  };

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleShopFollow(shopId))}
      className="w-full max-w-[200px] font-medium text-base py-3 px-6 rounded-full shadow-soft hover:opacity-80 active:translate-y-[1px] transition-all mb-8 flex items-center justify-center gap-2 disabled:opacity-60"
      style={isFollowing ? followedStyle : notFollowedStyle}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        style={{ color: isFollowing ? textOnWhite : textOnQuaternary }}
      >
        {isFollowing ? "check" : "add"}
      </span>
      <span style={{ color: isFollowing ? textOnWhite : textOnQuaternary }}>
        {isFollowing ? "フォロー中" : "フォローする"}
      </span>
    </button>
  );
}
