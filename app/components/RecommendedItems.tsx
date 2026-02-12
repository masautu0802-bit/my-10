"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RecommendedItem } from "@/app/lib/recommendation";

interface RecommendedItemsProps {
  items: RecommendedItem[];
}

function RecommendedItemCard({ item }: { item: RecommendedItem }) {
  return (
    <Link href={`/items/${item.itemId}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300">
        {/* 画像エリア */}
        <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {item.imageUrl ? (
            <>
              <div className="absolute inset-0 p-3">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 42vw, 180px"
                />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-50/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-100/30 to-transparent" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-5xl">
                image
              </span>
            </div>
          )}

          {/* ソースバッジ */}
          {item.sources.length > 1 && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-coral/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                ✨ おすすめ
              </div>
            </div>
          )}
        </div>

        {/* テキストエリア */}
        <div className="p-2.5">
          <h4 className="text-[11px] font-bold text-[#2a2a2a] mb-0.5 line-clamp-2 leading-tight">
            {item.name}
          </h4>
          <p className="text-[10px] text-[#2a2a2a]/50 truncate">
            {item.shopName}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function RecommendedItems({ items }: RecommendedItemsProps) {
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) return null;

  const displayItems = showAll ? items : items.slice(0, 8);

  return (
    <section className="pt-8 pb-4">
      {/* セクションヘッダー */}
      <div className="mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-coral/20 rounded-lg text-coral">
            <span className="material-symbols-outlined text-[18px]">
              auto_awesome
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-dark">
            For You
          </h3>
        </div>
        <p className="text-[10px] text-text-main/40 mt-1 ml-11 font-medium">
          あなたの好みに合わせたおすすめアイテム
        </p>
      </div>

      {/* アイテムグリッド - Pinterest風2カラム */}
      <div className="flex gap-2.5">
        {/* 左カラム */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          {displayItems
            .filter((_, i) => i % 2 === 0)
            .map((item) => (
              <RecommendedItemCard key={item.itemId} item={item} />
            ))}
        </div>

        {/* 右カラム - 少し下げてPinterest風 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5 pt-10">
          {displayItems
            .filter((_, i) => i % 2 !== 0)
            .map((item) => (
              <RecommendedItemCard key={item.itemId} item={item} />
            ))}
        </div>
      </div>

      {/* もっと見るボタン */}
      {!showAll && items.length > 8 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 text-sm font-bold text-[#2a2a2a] hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              expand_more
            </span>
            もっと見る（{items.length - 8}件）
          </button>
        </div>
      )}
    </section>
  );
}
