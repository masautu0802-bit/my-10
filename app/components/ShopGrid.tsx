"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ShopItem = { id: string; name: string; image_url: string | null };

type Shop = {
  id: string;
  name: string;
  ownerName: string;
  theme: string;
  followers: number;
  items: ShopItem[];
  tags?: string[] | null;
};

type TagCategory = {
  name: string;
  gradient: string;
  badge?: string;
  imageUrl?: string;
};

function truncateLabel(text: string, maxLen = 12): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "---";
}

function ShopCard({ shop }: { shop: Shop }) {
  const [mainItem, ...subItems] = shop.items;
  const sub1 = subItems[0];
  const sub2 = subItems[1];

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)] mb-5"
      style={{
        backgroundColor: "white",
        boxShadow: "0 20px 40px -20px rgba(0,0,0,0.1)",
      }}
    >
      {/* ショップ名 - ミニマルなサイネージ風 */}
      <div className="px-4 py-3 bg-white/50 backdrop-blur-md">
        <h4 className="font-serif font-bold text-base tracking-tight text-[#2a2a2a] truncate">
          {shop.name}
        </h4>
      </div>

      {/* トリプティック画像レイアウト - ショーケース風 */}
      <div className="px-2 pb-2">
        <div className="relative w-full overflow-hidden rounded-2xl">
          {/* ガラスフレームエフェクト */}
          <div className="absolute inset-0 border-[8px] border-white/20 z-20 pointer-events-none rounded-2xl"></div>
          <div className="absolute inset-0 border border-white/10 z-20 pointer-events-none rounded-2xl"></div>

          {/* 画像グリッド: 大1つ + 小2つ - Pinterest風に縦長 */}
          <div className="grid grid-cols-3 gap-1 aspect-[3/4]">
            {/* メイン画像 */}
            <div className="col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              {mainItem?.image_url ? (
                <>
                  <div className="absolute inset-0 p-2">
                    <Image
                      src={mainItem.image_url}
                      alt={mainItem.name}
                      fill
                      className="object-contain transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 768px) 45vw, 300px"
                    />
                  </div>
                  {/* フェードアウトエフェクト */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100/40 to-transparent" />
                    <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-gray-50/30 to-transparent" />
                    <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-gray-50/30 to-transparent" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* サイド画像カラム */}
            <div className="col-span-1 grid grid-rows-2 gap-1">
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {sub1?.image_url ? (
                  <>
                    <div className="absolute inset-0 p-1.5">
                      <Image
                        src={sub1.image_url}
                        alt={sub1.name}
                        fill
                        className="object-contain transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 22vw, 150px"
                      />
                    </div>
                    {/* フェードアウトエフェクト */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-100/40 to-transparent" />
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-gray-50/30 to-transparent" />
                      <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-gray-50/30 to-transparent" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {sub2?.image_url ? (
                  <>
                    <div className="absolute inset-0 p-1.5">
                      <Image
                        src={sub2.image_url}
                        alt={sub2?.name ?? ""}
                        fill
                        className="object-contain transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 22vw, 150px"
                      />
                    </div>
                    {/* フェードアウトエフェクト */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-50/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-100/40 to-transparent" />
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-gray-50/30 to-transparent" />
                      <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-l from-gray-50/30 to-transparent" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            </div>
          </div>

          {/* ガラス反射オーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-30 mix-blend-overlay z-10 pointer-events-none"></div>
        </div>
      </div>

      {/* 装飾アクセント */}
      <div className="h-1 w-full bg-sage/10"></div>
    </Link>
  );
}

export default function ShopGrid({
  initialShops,
  categories,
}: {
  initialShops: Shop[];
  categories: TagCategory[];
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredShops = selectedTag
    ? initialShops.filter(
        (shop) => shop.tags && shop.tags.includes(selectedTag)
      )
    : initialShops;

  return (
    <>
      {/* Category Circles with Filter */}
      <section className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#2a2a2a] tracking-tight">
            見つける
          </h2>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs font-bold text-sage hover:text-sage/80 flex items-center gap-1 cursor-pointer transition-colors"
            >
              すべて見る
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-6 px-6 snap-x">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedTag(cat.name)}
                className={`snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer transition-all ${
                  selectedTag === cat.name ? "scale-110" : ""
                }`}
              >
                <div
                  className={`w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br ${cat.gradient} relative transition-transform duration-300 group-hover:scale-105 ${
                    selectedTag === cat.name
                      ? "ring-4 ring-sage/30"
                      : ""
                  }`}
                >
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-lg relative">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  {cat.badge && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                      {cat.badge}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold text-center transition-colors ${
                    selectedTag === cat.name
                      ? "text-sage"
                      : "text-[#2a2a2a]/70 group-hover:text-sage"
                  }`}
                >
                  #{cat.name}
                </span>
              </button>
            ))
          ) : (
            <div className="w-full text-center py-4 text-text-main/60 text-xs">
              まだタグが登録されていません
            </div>
          )}
        </div>
      </section>

      {/* Shop Grid - Masonry Style */}
      <section className="mt-2 px-3 pb-8 bg-[#FBF5ED] pt-6 rounded-t-3xl">
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="p-1.5 bg-sage/20 rounded-lg text-sage">
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-dark">
            {selectedTag ? `#${selectedTag}` : "Shops"}
          </h3>
          {selectedTag && (
            <span className="text-xs text-text-main/60">
              ({filteredShops.length}件)
            </span>
          )}
        </div>

        {filteredShops.length === 0 ? (
          <div className="text-center py-16 text-text-main/60">
            <span className="material-symbols-outlined text-[48px] mb-4 block">
              search_off
            </span>
            <p className="text-sm font-medium">
              {selectedTag
                ? `「${selectedTag}」のショップが見つかりませんでした`
                : "まだショップがありません"}
            </p>
          </div>
        ) : (
          <div className="flex gap-2.5">
            {/* 左カラム */}
            <div className="flex-1 flex flex-col">
              {filteredShops
                .filter((_, i) => i % 2 === 0)
                .map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
            </div>

            {/* 右カラム - 少し下げて交互配置（Pinterest風） */}
            <div className="flex-1 flex flex-col pt-16">
              {filteredShops
                .filter((_, i) => i % 2 !== 0)
                .map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
