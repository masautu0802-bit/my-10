"use client";

import { useEffect, useState } from "react";
import { updateItemPrice } from "@/app/actions/item";

export default function PriceUpdater({
  itemId,
  initialPrice,
}: {
  itemId: string;
  initialPrice: string | null;
}) {
  const [price, setPrice] = useState(initialPrice);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 価格が未設定の場合のみ更新を試みる
    if (!initialPrice) {
      setIsUpdating(true);
      updateItemPrice(itemId)
        .then((result) => {
          if (result.price) {
            setPrice(result.price);
          }
        })
        .catch(() => {
          // エラーは無視（価格が取得できなくても問題ない）
        })
        .finally(() => {
          setIsUpdating(false);
        });
    }
  }, [itemId, initialPrice]);

  if (!price && !isUpdating) return null;

  return (
    <div className="absolute -bottom-6 right-6 bg-bgwarm text-text-main px-6 py-3 rounded-2xl shadow-lg z-20">
      {isUpdating ? (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-sm text-text-main">
            progress_activity
          </span>
          <p className="text-lg font-bold font-display tracking-tight text-text-main">
            価格取得中...
          </p>
        </div>
      ) : (
        <p className="text-2xl font-bold font-display tracking-tight text-text-main">
          {price}
        </p>
      )}
    </div>
  );
}
