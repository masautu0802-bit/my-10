"use client";

import { useRouter } from "next/navigation";
import { CSSProperties } from "react";

type BackButtonProps = {
  className?: string;
  iconSize?: number;
  icon?: string;
  style?: CSSProperties;
  iconStyle?: CSSProperties;
};

export default function BackButton({
  className = "",
  iconSize = 20,
  icon = "arrow_back_ios_new",
  style,
  iconStyle,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={
        className ||
        "flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:scale-105 transition-transform text-text-main border border-sage/50"
      }
      style={style}
      aria-label="戻る"
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: iconSize, ...iconStyle }}
      >
        {icon}
      </span>
    </button>
  );
}
