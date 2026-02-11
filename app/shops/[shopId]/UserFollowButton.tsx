"use client";

import { useTransition } from "react";
import { toggleUserFollow } from "@/app/actions/user";
import { getContrastTextColor } from "@/app/lib/shop-customization";

export default function UserFollowButton({
  userId,
  isFollowing,
  primaryColor = "#8FBC8F",
  tertiaryColor = "#FFE8CD",
  isDark = false,
}: {
  userId: string;
  isFollowing: boolean;
  primaryColor?: string;
  tertiaryColor?: string;
  isDark?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  // 背景色に応じた適切なテキスト色を計算
  const textOnTertiary = getContrastTextColor(tertiaryColor);
  const textOnWhite = isDark ? "#FFFFFF" : "#2C3E50";

  const followedBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)";

  const followedStyle = {
    backgroundColor: followedBg,
    color: textOnWhite,
    border: `2px solid ${tertiaryColor}`,
  };

  const notFollowedStyle = {
    backgroundColor: tertiaryColor,
    color: textOnTertiary,
    border: `2px solid ${tertiaryColor}`,
  };

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleUserFollow(userId))}
      className="w-full max-w-[200px] font-medium text-sm py-2.5 px-5 rounded-full shadow-soft hover:opacity-80 active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      style={isFollowing ? followedStyle : notFollowedStyle}
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ color: isFollowing ? textOnWhite : textOnTertiary }}
      >
        {isFollowing ? "person_check" : "person_add"}
      </span>
      <span style={{ color: isFollowing ? textOnWhite : textOnTertiary }}>
        {isFollowing ? "フォロー中" : "フォローする"}
      </span>
    </button>
  );
}
