"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import KeepModal from "../KeepModal";

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

export default function KeepTabs({
  savedItems,
  keepFolders,
}: {
  savedItems: SavedItem[];
  keepFolders: KeepFolder[];
}) {
  const [activeTab, setActiveTab] = useState<"items" | "folders">("items");
  const [keepModalItemId, setKeepModalItemId] = useState<string | null>(null);

  const tabs = [
    { key: "items" as const, label: "保存アイテム", count: savedItems.length },
    { key: "folders" as const, label: "フォルダ", count: keepFolders.length },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex px-5 pt-2 bg-bgwarm sticky top-[57px] z-40 border-b border-text-main/10">
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
            {tab.count > 0 && (
              <span className="ml-1 text-xs text-text-main/60">({tab.count})</span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-sage rounded-full" />
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-24">
        {/* Items tab */}
        {activeTab === "items" && (
          savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-main/60">
              <span className="material-symbols-outlined text-[48px] mb-4">
                bookmark
              </span>
              <p className="text-sm font-medium">
                保存したアイテムはありません
              </p>
              <p className="text-xs mt-1">
                気になる商品を保存しましょう
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedItems.map((item) => (
                <div key={item.id} className="relative">
                  <Link
                    href={`/items/${item.id}`}
                    className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 45vw, 200px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-[48px]">
                            image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-text-main line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      {item.price_range && (
                        <p className="text-xs text-text-main/60">
                          {item.price_range}
                        </p>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => setKeepModalItemId(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-sage">
                      add
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Folders tab */}
        {activeTab === "folders" && (
          keepFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-main/60">
              <span className="material-symbols-outlined text-[48px] mb-4">
                folder
              </span>
              <p className="text-sm font-medium">
                フォルダがありません
              </p>
              <p className="text-xs mt-1">
                アイテムをフォルダに整理しましょう
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {keepFolders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/my/keep/${folder.id}`}
                  className="flex gap-3 p-4 bg-white rounded-2xl border border-sage/20 hover:border-sage/40 hover:shadow-md transition-all"
                >
                  {/* フォルダプレビュー */}
                  <div className="grid grid-cols-3 gap-1 w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {folder.preview_images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative bg-gray-50">
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="28px"
                        />
                      </div>
                    ))}
                    {Array.from({ length: 3 - folder.preview_images.length }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-300 text-[16px]">
                          image
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* フォルダ情報 */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-text-main text-base truncate mb-1">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-text-main/60">
                      {folder.item_count}個のアイテム
                    </p>
                  </div>

                  {/* 右矢印 */}
                  <div className="flex items-center text-text-main/30">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>

      {/* Keep Modal */}
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
