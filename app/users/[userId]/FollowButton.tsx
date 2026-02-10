"use client";

import { useState, useTransition } from "react";
import { toggleUserFollow } from "@/app/actions/user";

export default function FollowButton({
  userId,
  initialIsFollowing,
}: {
  userId: string;
  initialIsFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      setIsFollowing(!isFollowing);
      await toggleUserFollow(userId);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`w-full py-3 rounded-full font-bold text-sm transition-all disabled:opacity-50 ${
        isFollowing
          ? "bg-white border-2 border-sage text-sage hover:bg-sage/10"
          : "bg-sage text-white hover:bg-sage/90"
      }`}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined animate-spin text-[18px]">
            progress_activity
          </span>
        </span>
      ) : isFollowing ? (
        "フォロー中"
      ) : (
        "フォローする"
      )}
    </button>
  );
}
