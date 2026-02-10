import Link from "next/link";
import BottomNav from "@/app/components/BottomNav";
import ShopGrid from "@/app/components/ShopGrid";
import { createClient } from "@/app/lib/supabase/server";

type ShopItem = { id: string; name: string; image_url: string | null };

type TagCategory = {
  name: string;
  gradient: string;
  badge?: string;
  imageUrl?: string;
};

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

async function getTopTags(): Promise<TagCategory[]> {
  const supabase = await createClient();

  // Get all shops with tags
  const { data: shops } = await supabase
    .from("shops")
    .select("id, tags")
    .not("tags", "is", null);

  if (!shops || shops.length === 0) return [];

  // Count tag occurrences and build tag->shopIds mapping
  const tagCounts: Record<string, number> = {};
  const tagShopIds: Record<string, string[]> = {};
  shops.forEach((shop) => {
    shop.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      if (!tagShopIds[tag]) tagShopIds[tag] = [];
      tagShopIds[tag].push(shop.id);
    });
  });

  // Sort by count and get top tags
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag);

  if (topTags.length === 0) return [];

  // Collect all relevant shop IDs
  const allShopIds = [...new Set(topTags.flatMap((tag) => tagShopIds[tag] || []))];

  if (allShopIds.length === 0) return [];

  // Batch: get all follows and items in 2 queries
  const [{ data: allFollows }, { data: allItems }] = await Promise.all([
    supabase.from("shop_follows").select("shop_id").in("shop_id", allShopIds),
    supabase.from("items").select("shop_id, image_url, order_index").in("shop_id", allShopIds).order("order_index", { ascending: true }),
  ]);

  // Build follower count map
  const followerCountMap: Record<string, number> = {};
  allFollows?.forEach((f) => {
    followerCountMap[f.shop_id] = (followerCountMap[f.shop_id] || 0) + 1;
  });

  // Build first item image map (first item per shop by order_index)
  const firstItemImageMap: Record<string, string | null> = {};
  allItems?.forEach((item) => {
    if (!(item.shop_id in firstItemImageMap)) {
      firstItemImageMap[item.shop_id] = item.image_url;
    }
  });

  // Compute tag categories in JS
  return topTags.map((tag, index) => {
    const shopIds = tagShopIds[tag] || [];
    if (shopIds.length === 0) {
      return {
        name: tag,
        gradient: gradients[index % gradients.length],
        badge: index === 0 ? "Hot" : undefined,
      };
    }

    // Find shop with most followers
    const topShopId = shopIds.reduce((a, b) =>
      (followerCountMap[a] || 0) >= (followerCountMap[b] || 0) ? a : b
    );

    return {
      name: tag,
      gradient: gradients[index % gradients.length],
      badge: index === 0 ? "Hot" : undefined,
      imageUrl: firstItemImageMap[topShopId] || undefined,
    };
  });
}

async function getShops() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select(`
      id,
      name,
      theme,
      owner_id,
      tags,
      users!shops_owner_id_fkey ( name )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!shops) return [];

  const shopIds = shops.map((s) => s.id);

  // Get follower counts
  const { data: followCounts } = await supabase
    .from("shop_follows")
    .select("shop_id")
    .in("shop_id", shopIds);

  const countMap: Record<string, number> = {};
  followCounts?.forEach((f) => {
    countMap[f.shop_id] = (countMap[f.shop_id] || 0) + 1;
  });

  // Get items for all shops (first 3 per shop by order_index)
  const { data: allItems } = await supabase
    .from("items")
    .select("id, name, image_url, shop_id, order_index")
    .in("shop_id", shopIds)
    .order("order_index", { ascending: true });

  const itemsByShop: Record<string, ShopItem[]> = {};
  for (const id of shopIds) itemsByShop[id] = [];
  allItems?.forEach((item) => {
    const list = itemsByShop[item.shop_id];
    if (list && list.length < 3) {
      list.push({ id: item.id, name: item.name, image_url: item.image_url });
    }
  });

  const shopsWithCounts = shops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    ownerName: (shop.users as unknown as { name: string })?.name || "不明",
    theme: shop.theme,
    followers: countMap[shop.id] || 0,
    items: itemsByShop[shop.id] || [],
    tags: shop.tags,
  }));

  return shopsWithCounts.sort((a, b) => b.followers - a.followers);
}

export default async function Home() {
  const [shops, categories] = await Promise.all([getShops(), getTopTags()]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-[#E5E7EB] shadow-2xl">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-bgwarm">
      {/* Header - ブティックストリート風 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg px-6 py-5 border-b border-sage/10 flex items-center justify-between shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-black mb-1 text-sage/60">
            <span className="material-symbols-outlined text-[10px]">
              location_on
            </span>
            <span>Your Shopping Street</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-3 text-[#2a2a2a]">
            My10
            <span className="h-1 w-8 rounded-full bg-coral/30 mt-1"></span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md active:scale-95 text-[#2a2a2a]"
          >
            <span className="material-symbols-outlined text-[20px]">
              search
            </span>
          </Link>
          <button className="p-3 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md active:scale-95 text-[#2a2a2a] relative">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-coral rounded-full border border-white" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-[var(--bottom-nav-safe)]">
        <ShopGrid initialShops={shops} categories={categories} />
      </main>

      <BottomNav />
      </div>
    </div>
  );
}
