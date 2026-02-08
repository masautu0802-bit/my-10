import Link from "next/link";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";

const categories = [
  { name: "編集部ピック", gradient: "from-coral to-sage", badge: "Hot" },
  { name: "トレンド", gradient: "from-sage to-teal-300" },
  { name: "新着", gradient: "from-yellow-300 to-orange-300" },
  { name: "おすすめ", gradient: "from-purple-300 to-pink-300" },
];

const themeColors: Record<string, string> = {
  default: "bg-sage",
};

async function getShops() {
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("shops")
    .select(`
      id,
      name,
      theme,
      owner_id,
      users!shops_owner_id_fkey ( name )
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  if (!shops) return [];

  // Get follower counts for each shop
  const shopIds = shops.map((s) => s.id);
  const { data: followCounts } = await supabase
    .from("shop_follows")
    .select("shop_id")
    .in("shop_id", shopIds);

  const countMap: Record<string, number> = {};
  followCounts?.forEach((f) => {
    countMap[f.shop_id] = (countMap[f.shop_id] || 0) + 1;
  });

  return shops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    ownerName: (shop.users as unknown as { name: string })?.name || "不明",
    theme: shop.theme,
    themeColor: themeColors[shop.theme] || "bg-sage",
    followers: countMap[shop.id] || 0,
  }));
}

function formatFollowers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export default async function Home() {
  const shops = await getShops();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-bgwarm shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md px-5 py-4 flex items-center justify-between shadow-sm border-b border-sage/10">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-sage font-display">
            My10
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-coral mt-1.5" />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-dark hover:bg-sage hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[22px]">
              search
            </span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 text-dark hover:bg-sage hover:text-white transition-colors relative">
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-coral rounded-full border border-white" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-28">
        {/* Category Circles */}
        <section className="px-5 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark tracking-tight">
              見つける
            </h2>
            <span className="text-xs font-bold text-sage hover:text-sage/80 flex items-center gap-1 cursor-pointer">
              すべて見る
              <span className="material-symbols-outlined text-xs">
                arrow_forward
              </span>
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5 snap-x">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="snap-start shrink-0 w-[4.5rem] flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-[4.5rem] h-[4.5rem] rounded-full p-0.5 bg-gradient-to-br ${cat.gradient} relative`}
                >
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200 shadow-sm" />
                  {cat.badge && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                      {cat.badge}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-center text-dark/80 group-hover:text-sage transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Shop Grid */}
        <section className="mt-2 px-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-sage/20 rounded-lg text-sage">
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-dark">
              厳選ショップ
            </h3>
          </div>

          {shops.length === 0 ? (
            <div className="text-center py-16 text-text-main/60">
              <span className="material-symbols-outlined text-[48px] mb-4 block">
                storefront
              </span>
              <p className="text-sm font-medium">
                まだショップがありません
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm text-[9px] font-bold px-2 py-1 rounded-full text-dark flex items-center gap-1 shadow-sm">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${shop.themeColor}`}
                        />
                        {shop.theme}
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <div className="h-8 w-8 rounded-full bg-gray-300 border-2 border-white shadow-sm" />
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-dark truncate">
                      {shop.name}
                    </h4>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                      by {shop.ownerName}
                    </span>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="material-symbols-outlined text-[14px] text-sage">
                          favorite
                        </span>
                        <span className="text-[10px] font-semibold">
                          {formatFollowers(shop.followers)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-sage">
                        詳細
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="h-8" />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
