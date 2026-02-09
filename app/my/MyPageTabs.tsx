"use client";

import { useState } from "react";
import Link from "next/link";

type FollowedShop = {
  id: string;
  name: string;
  first_item_image: string | null;
};

type SavedItem = {
  id: string;
  name: string;
  image_url: string;
  price_range: string | null;
  shop_id: string;
};

export default function MyPageTabs({
  followedShops,
  savedItems,
}: {
  followedShops: FollowedShop[];
  savedItems: SavedItem[];
}) {
  const [activeTab, setActiveTab] = useState<"shops" | "items">("shops");

  return (
    <>
      {/* Tabs */}
      <div className="flex px-2">
        <button
          className={`flex-1 pb-3 text-center text-sm transition-all relative ${
            activeTab === "shops"
              ? "font-bold text-text-main"
              : "font-medium text-gray-400 hover:text-text-main"
          }`}
          onClick={() => setActiveTab("shops")}
        >
          フォロー中のショップ
          {activeTab === "shops" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-sage rounded-full" />
          )}
        </button>
        <button
          className={`flex-1 pb-3 text-center text-sm transition-all relative ${
            activeTab === "items"
              ? "font-bold text-text-main"
              : "font-medium text-gray-400 hover:text-text-main"
          }`}
          onClick={() => setActiveTab("items")}
        >
          保存した商品
          {activeTab === "items" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-sage rounded-full" />
          )}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        {activeTab === "shops" ? (
          followedShops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-main/60">
              <span className="material-symbols-outlined text-[48px] mb-4">
                storefront
              </span>
              <p className="text-sm font-medium">
                フォロー中のショップはありません
              </p>
              <p className="text-xs mt-1">
                気になるショップをフォローしましょう
              </p>
            </div>
          ) : (
            followedShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="block bg-white rounded-xl p-3 shadow-soft hover:shadow-soft-hover transition-shadow border border-text-main/5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {shop.first_item_image ? (
                      <img
                        src={shop.first_item_image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">
                          storefront
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm leading-tight text-text-main truncate">
                      {shop.name}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 text-[18px]">
                    chevron_right
                  </span>
                </div>
              </Link>
            ))
          )
        ) : savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-main/60">
            <span className="material-symbols-outlined text-[48px] mb-4">
              favorite_border
            </span>
            <p className="text-sm font-medium">保存した商品はありません</p>
            <p className="text-xs mt-1">
              気になる商品をお気に入りに追加しましょう
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {savedItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="block bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-shadow border border-text-main/5 group"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-text-main truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs font-semibold text-text-main/70 mt-1">
                    {item.price_range || "価格未設定"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
