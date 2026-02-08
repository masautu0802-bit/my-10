import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";
import FollowButton from "./FollowButton";
import ShopItemsWithPriceUpdate from "./ShopItemsWithPriceUpdate";

async function getShopData(shopId: string) {
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select(`
      *,
      users!shops_owner_id_fkey ( name )
    `)
    .eq("id", shopId)
    .single();

  if (!shop) return null;

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("shop_id", shopId)
    .order("order_index", { ascending: true });

  const { count: followerCount } = await supabase
    .from("shop_follows")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);

  return {
    shop,
    ownerName: (shop.users as unknown as { name: string })?.name || "不明",
    items: items || [],
    followerCount: followerCount || 0,
  };
}

async function getFollowState(shopId: string, userId: string | undefined) {
  if (!userId) return { isFollowing: false, favorites: new Set<string>() };
  const supabase = await createClient();

  const { data: follow } = await supabase
    .from("shop_follows")
    .select("user_id")
    .eq("user_id", userId)
    .eq("shop_id", shopId)
    .single();

  const { data: favs } = await supabase
    .from("item_favorites")
    .select("item_id")
    .eq("user_id", userId);

  return {
    isFollowing: !!follow,
    favorites: new Set(favs?.map((f) => f.item_id) || []),
  };
}

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const [shopData, user] = await Promise.all([
    getShopData(shopId),
    getCurrentUser(),
  ]);

  if (!shopData) notFound();

  const { shop, ownerName, items, followerCount } = shopData;
  const { isFollowing, favorites } = await getFollowState(shopId, user?.id);
  const isOwner = user?.id === shop.owner_id;

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-bgwarm/90 backdrop-blur-md transition-all">
        <Link
          href="/"
          className="flex items-center justify-center size-10 rounded-full bg-white/80 border border-sage/20 shadow-sm hover:bg-sage-light/20 transition-all text-text-main"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back_ios_new
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/cms/shops/${shopId}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-sage/10 border border-sage/20 hover:bg-sage/20 transition-all text-text-main"
            >
              <span className="material-symbols-outlined text-[18px]">
                edit_square
              </span>
              <span className="text-xs font-bold">管理</span>
            </Link>
          )}
          <button className="flex items-center justify-center size-10 rounded-full bg-white/80 border border-sage/20 shadow-sm hover:bg-sage-light/20 transition-all text-text-main">
            <span className="material-symbols-outlined text-[20px]">
              ios_share
            </span>
          </button>
        </div>
      </div>

      <main className="flex-1 pb-32">
        <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-sage-light/30 blur-3xl opacity-60" />
          <div className="absolute top-10 -left-10 w-72 h-72 rounded-full bg-sage/20 blur-3xl opacity-60" />
        </div>

        {/* Shop Profile */}
        <div className="px-6 pt-2 pb-8 flex flex-col items-center text-center relative">
          <div className="relative group cursor-pointer mb-5">
            <div className="size-28 rounded-full p-1 border border-sage/30 bg-white/50">
              <div className="size-full rounded-full bg-gray-200 overflow-hidden" />
            </div>
            <div className="absolute bottom-0 right-0 bg-sage text-bgwarm rounded-full p-1 shadow-sm border-2 border-bgwarm">
              <span className="material-symbols-outlined text-[16px]">
                verified
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2 text-text-main font-display">
            {shop.name}
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 bg-white/40 border border-sage/10">
            <span className="size-1.5 rounded-full bg-sage" />
            <p className="text-text-main text-xs font-medium uppercase tracking-wider">
              Curator: {ownerName}
            </p>
          </div>

          <div className="flex gap-10 mb-8 text-sm bg-white/60 backdrop-blur-sm px-8 py-3 rounded-2xl border border-sage/10 shadow-soft">
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-bold text-lg text-text-main">
                {followerCount}
              </span>
              <span className="text-text-main/80 text-[10px] uppercase tracking-wider">
                フォロワー
              </span>
            </div>
            <div className="w-px h-auto bg-text-main/20" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-bold text-lg text-text-main">
                {items.length}
              </span>
              <span className="text-text-main/80 text-[10px] uppercase tracking-wider">
                アイテム
              </span>
            </div>
          </div>

          <FollowButton shopId={shopId} isFollowing={isFollowing} />

          {/* タグ表示 */}
          {shop.tags && shop.tags.length > 0 && (
            <div className="flex gap-2 mt-8 flex-wrap justify-center">
              {shop.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 rounded-full bg-sage/10 text-text-main border border-sage/30 text-xs font-medium tracking-wide shadow-sm hover:bg-sage/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {shop.description && (
            <div className="relative max-w-md mx-auto px-4 mt-6">
              <p className="text-text-main text-sm leading-relaxed text-center italic">
                &quot;{shop.description}&quot;
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            <span className="px-4 py-1.5 rounded-full bg-white/80 text-text-main border border-sage/20 text-xs font-medium tracking-wide shadow-sm">
              {shop.theme}
            </span>
          </div>
        </div>

        {/* Collection header */}
        <div className="px-6 py-4 flex items-center justify-between sticky top-[72px] z-30 bg-bgwarm/95 backdrop-blur-md border-t border-sage/10">
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 text-text-main">
            コレクション
            <span className="text-[10px] bg-sage/20 text-text-main px-2 py-0.5 rounded-full font-medium">
              {items.length} アイテム
            </span>
          </h3>
        </div>

        {/* Masonry Grid */}
        <ShopItemsWithPriceUpdate initialItems={items} favorites={favorites} />
      </main>

      <BottomNav />
    </div>
  );
}
