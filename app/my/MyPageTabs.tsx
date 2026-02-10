"use client";

import { useState } from "react";
import Link from "next/link";
import KeepModal from "./KeepModal";

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

type KeepFolder = {
  id: string;
  name: string;
  item_count: number;
  preview_images: string[];
};

export default function MyPageTabs({
  followedShops,
  savedItems,
  keepFolders,
}: {
  followedShops: FollowedShop[];
  savedItems: SavedItem[];
  keepFolders: KeepFolder[];
}) {
  const [activeTab, setActiveTab] = useState<"shops" | "items" | "keep">("shops");
  const [keepModalItemId, setKeepModalItemId] = useState<string | null>(null);

  const tabs = [
    { key: "shops" as const, label: "フォロー" },
    { key: "items" as const, label: "保存" },
    { key: "keep" as const, label: "キープ" },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 pb-3 text-center text-sm transition-all relative ${
              activeTab === tab.key
                ? "font-bold text-text-main"
                : "font-medium text-gray-400 hover:text-text-main"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-sage rounded-full" />
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 space-y-4 pb-[var(--bottom-nav-safe)]">
        {/* Shops tab */}
        {activeTab === "shops" && (
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
        )}

        {/* Saved items tab */}
        {activeTab === "items" && (
          savedItems.length === 0 ? (
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
                <div
                  key={item.id}
                  className="relative bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-shadow border border-text-main/5 group"
                >
                  <Link href={`/items/${item.id}`} className="block">
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
                  {/* Keep button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setKeepModalItemId(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors z-10"
                    title="キープフォルダに追加"
                  >
                    <span className="material-symbols-outlined text-[18px] text-text-main/60">
                      bookmark_add
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Keep folders tab */}
        {activeTab === "keep" && (
          keepFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-main/60">
              <span className="material-symbols-outlined text-[48px] mb-4">
                folder_open
              </span>
              <p className="text-sm font-medium">キープフォルダはありません</p>
              <p className="text-xs mt-1">
                保存した商品からキープフォルダに追加しましょう
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {keepFolders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/my/keep/${folder.id}`}
                  className="block bg-white rounded-xl p-4 shadow-soft hover:shadow-soft-hover transition-shadow border border-text-main/5"
                >
                  <div className="flex items-center gap-3">
                    {/* Preview thumbnails */}
                    <div className="flex -space-x-2 shrink-0">
                      {folder.preview_images.length > 0 ? (
                        folder.preview_images.map((img, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm"
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-[20px]">
                            folder
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-text-main truncate">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-text-main/50 mt-0.5">
                        {folder.item_count}件の商品
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 text-[18px]">
                      chevron_right
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>

      {/* Keep modal */}
      {keepModalItemId && (
        <KeepModal
          itemId={keepModalItemId}
          folders={keepFolders}
          onClose={() => setKeepModalItemId(null)}
        />
      )}
    </>
  );
}
