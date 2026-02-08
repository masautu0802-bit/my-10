"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { searchShops, getPopularTags, type SearchResult } from "@/app/actions/search";

const gradients = [
  "from-coral to-sage",
  "from-sage to-teal-300",
  "from-yellow-300 to-orange-300",
  "from-purple-300 to-pink-300",
  "from-rose-300 to-pink-400",
  "from-blue-300 to-indigo-400",
  "from-green-300 to-emerald-400",
  "from-orange-300 to-red-400",
];

// ヒット部分をハイライト表示するヘルパー関数
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-text-main font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    byShopName: [],
    byUserName: [],
    byTag: [],
    byItemName: [],
  });
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; imageUrl: string | null }>>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Load popular tags on mount
    getPopularTags().then(setPopularTags);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        byShopName: [],
        byUserName: [],
        byTag: [],
        byItemName: [],
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      startTransition(async () => {
        const searchResults = await searchShops(query);
        setResults(searchResults);
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleTagClick = (tagName: string) => {
    setQuery(tagName);
  };

  const totalResults =
    results.byShopName.length +
    results.byUserName.length +
    results.byTag.length +
    results.byItemName.length;

  return (
    <div className="min-h-screen bg-bgwarm pb-32 max-w-md mx-auto shadow-2xl">
      {/* Header with Search Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg px-6 py-5 border-b border-sage/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center size-10 rounded-full bg-gray-50 text-text-main hover:bg-gray-100 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
          </Link>
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ショップ、商品、タグを検索..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-full px-5 py-3 pr-10 text-base font-medium focus:outline-none focus:border-sage focus:ring-0 transition-all placeholder:text-gray-400 text-text-main"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-6 pt-6">
        {!query.trim() ? (
          <>
            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold text-text-main/70 uppercase tracking-wider mb-4">
                  人気のタグ
                </h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-6 px-6 snap-x">
                  {popularTags.map((tagData, index) => (
                    <button
                      key={tagData.tag}
                      onClick={() => handleTagClick(tagData.tag)}
                      className="snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <div
                        className={`w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br ${
                          gradients[index % gradients.length]
                        } relative transition-transform duration-300 group-hover:scale-105`}
                      >
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-lg relative">
                          {tagData.imageUrl ? (
                            <Image
                              src={tagData.imageUrl}
                              alt={tagData.tag}
                              fill
                              className="object-cover"
                              sizes="72px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-2xl">
                                tag
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-center text-[#2a2a2a]/70 group-hover:text-sage transition-colors">
                        #{tagData.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <span className="material-symbols-outlined text-[64px] text-sage/30">
                search
              </span>
              <h1 className="text-lg font-bold text-text-main">
                ショップを探す
              </h1>
              <p className="text-sm text-text-main/60 text-center max-w-xs">
                ショップ名、商品名、タグ、オーナー名で検索できます
              </p>
            </div>
          </>
        ) : isPending ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-sage text-4xl">
              progress_activity
            </span>
          </div>
        ) : totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <span className="material-symbols-outlined text-[64px] text-text-main/30">
              search_off
            </span>
            <h2 className="text-lg font-bold text-text-main">
              見つかりませんでした
            </h2>
            <p className="text-sm text-text-main/60 text-center max-w-xs">
              「{query}」に一致する結果はありません
            </p>
          </div>
        ) : (
          <div className="space-y-8 pb-8">
            {/* Results by Shop Name */}
            {results.byShopName.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-text-main/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    storefront
                  </span>
                  ショップ名 ({results.byShopName.length})
                </h2>
                <div className="space-y-2">
                  {results.byShopName.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/shops/${shop.id}`}
                      className="block bg-white rounded-xl p-4 shadow-sm border border-sage/10 hover:border-sage/30 transition-all"
                    >
                      <h3 className="font-bold text-base text-text-main mb-1">
                        {highlightMatch(shop.name, query)}
                      </h3>
                      <p className="text-xs text-text-main/60 mb-2">
                        by {shop.owner_name}
                      </p>
                      {shop.tags && shop.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {shop.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-sage/10 text-text-main font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Results by User Name */}
            {results.byUserName.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-text-main/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    person
                  </span>
                  オーナー名 ({results.byUserName.length})
                </h2>
                <div className="space-y-2">
                  {results.byUserName.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/shops/${shop.id}`}
                      className="block bg-white rounded-xl p-4 shadow-sm border border-sage/10 hover:border-sage/30 transition-all"
                    >
                      <p className="text-xs text-text-main/60 mb-1">
                        by {highlightMatch(shop.owner_name, query)}
                      </p>
                      <h3 className="font-bold text-base text-text-main mb-2">
                        {shop.name}
                      </h3>
                      {shop.tags && shop.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {shop.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-sage/10 text-text-main font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Results by Tag */}
            {results.byTag.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-text-main/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    tag
                  </span>
                  タグ ({results.byTag.length})
                </h2>
                <div className="space-y-2">
                  {results.byTag.map((shop) => (
                    <Link
                      key={shop.id}
                      href={`/shops/${shop.id}`}
                      className="block bg-white rounded-xl p-4 shadow-sm border border-sage/10 hover:border-sage/30 transition-all"
                    >
                      <h3 className="font-bold text-base text-text-main mb-1">
                        {shop.name}
                      </h3>
                      <p className="text-xs text-text-main/60 mb-2">
                        by {shop.owner_name}
                      </p>
                      {shop.tags && shop.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {shop.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                tag.toLowerCase().includes(query.toLowerCase())
                                  ? "bg-yellow-200 text-text-main border border-yellow-300 font-bold"
                                  : "bg-sage/10 text-text-main"
                              }`}
                            >
                              #{highlightMatch(tag, query)}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Results by Item Name */}
            {results.byItemName.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-text-main/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    shopping_bag
                  </span>
                  商品名 ({results.byItemName.length})
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {results.byItemName.map((item, index) => (
                    <Link
                      key={`${item.shop_id}-${index}`}
                      href={`/shops/${item.shop_id}`}
                      className="block bg-white rounded-xl overflow-hidden shadow-sm border border-sage/10 hover:border-sage/30 transition-all group"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        <div className="absolute inset-0 p-3">
                          <Image
                            src={item.item_image}
                            alt={item.item_name}
                            fill
                            className="object-contain transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 45vw, 200px"
                          />
                        </div>
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-50/40 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100/40 to-transparent" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs font-bold text-text-main mb-1 line-clamp-2">
                          {highlightMatch(item.item_name, query)}
                        </h4>
                        <p className="text-[10px] text-text-main/60 truncate">
                          {item.shop_name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
