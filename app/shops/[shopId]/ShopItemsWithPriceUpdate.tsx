"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { updateItemPrice } from "@/app/actions/item";
import FavoriteButton from "./FavoriteButton";

type Item = {
  id: string;
  name: string;
  image_url: string;
  price_range: string | null;
};

const aspectClasses = [
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[3/4]",
];

export default function ShopItemsWithPriceUpdate({
  initialItems,
  favorites,
}: {
  initialItems: Item[];
  favorites: Set<string>;
}) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    // 価格が未設定の商品の価格を更新（最初の3つまで）
    const itemsToUpdate = items
      .filter((item) => !item.price_range)
      .slice(0, 3);

    itemsToUpdate.forEach(async (item) => {
      const result = await updateItemPrice(item.id);
      if (result.price) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, price_range: result.price! } : i
          )
        );
      }
    });
  }, []);

  return (
    <div className="masonry-grid px-4 pt-2 pb-8">
      {items.map((item, i) => (
        <div key={item.id} className="masonry-item group relative">
          <Link
            href={`/items/${item.id}`}
            className="block relative overflow-hidden rounded-xl bg-white shadow-sm border border-sage/10 hover:border-sage/30 transition-all duration-300"
          >
            <div
              className={`${aspectClasses[i % aspectClasses.length]} overflow-hidden relative bg-gradient-to-br from-sage/5 to-sage/15`}
            >
              {item.image_url ? (
                <div className="absolute inset-0 p-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-gray-200" />
              )}
            </div>
            <div className="p-4 bg-white">
              <h4 className="text-sm font-medium text-text-main leading-tight group-hover:text-sage transition-colors line-clamp-2">
                {item.name}
              </h4>
              <p className="text-sm font-bold text-text-main mt-1">
                {item.price_range || "価格取得中..."}
              </p>
            </div>
          </Link>
          <FavoriteButton
            itemId={item.id}
            isFavorited={favorites.has(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
