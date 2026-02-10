import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import BackButton from "@/app/components/BackButton";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";

async function getFollowingShops(userId: string) {
  const supabase = await createClient();

  const { data: follows } = await supabase
    .from("shop_follows")
    .select(`
      created_at,
      shops (
        id,
        name,
        owner_id,
        users!shops_owner_id_fkey (
          name
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const shopList = (follows || [])
    .map((f) => ({
      followedAt: f.created_at,
      ...(f.shops as unknown as {
        id: string;
        name: string;
        owner_id: string;
        users: { name: string };
      }),
    }))
    .filter(Boolean);

  const shopIds = shopList.map((s) => s.id);

  // ショップフォロワー数を取得
  const { data: shopFollows } = await supabase
    .from("shop_follows")
    .select("shop_id")
    .in("shop_id", shopIds);

  const shopFollowerCounts: Record<string, number> = {};
  shopFollows?.forEach((sf) => {
    shopFollowerCounts[sf.shop_id] = (shopFollowerCounts[sf.shop_id] || 0) + 1;
  });

  // 各ショップの最初の3商品を取得
  const { data: allItems } = await supabase
    .from("items")
    .select("id, name, image_url, shop_id, order_index")
    .in("shop_id", shopIds)
    .order("order_index", { ascending: true });

  const itemsByShop: Record<string, Array<{ id: string; name: string; image_url: string | null }>> = {};
  shopIds.forEach((id) => (itemsByShop[id] = []));
  allItems?.forEach((item) => {
    const list = itemsByShop[item.shop_id];
    if (list && list.length < 3) {
      list.push({ id: item.id, name: item.name, image_url: item.image_url });
    }
  });

  return shopList.map((shop) => ({
    ...shop,
    ownerName: shop.users?.name || "不明",
    followerCount: shopFollowerCounts[shop.id] || 0,
    items: itemsByShop[shop.id] || [],
  }));
}

export default async function FollowingShopsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const shops = await getFollowingShops(user.id);

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center gap-3 px-5 py-4">
          <BackButton />
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            フォロー中のショップ
          </h1>
        </div>
      </header>

      <main className="flex-1 pb-24 px-5 py-6">
        {shops.length === 0 ? (
          <div className="text-center py-16 text-text-main/60">
            <span className="material-symbols-outlined text-[48px] mb-4 block">storefront</span>
            <p className="text-sm font-medium mb-2">フォロー中のショップがありません</p>
            <p className="text-xs mb-4">気になるショップをフォローしてみましょう</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-4 py-2 bg-sage text-white rounded-full text-sm font-bold hover:bg-sage/90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>ショップを探す</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="flex gap-3 p-4 bg-white rounded-2xl border border-sage/20 hover:border-sage/40 hover:shadow-md transition-all"
              >
                {/* ショップ画像プレビュー */}
                <div className="grid grid-cols-3 gap-1 w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {shop.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative bg-gray-50">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                  ))}
                  {Array.from({ length: 3 - shop.items.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="bg-gray-200" />
                  ))}
                </div>

                {/* ショップ情報 */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-text-main text-base truncate mb-1">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-text-main/60 mb-2">by {shop.ownerName}</p>
                  <div className="flex items-center gap-3 text-xs text-text-main/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">favorite</span>
                      {shop.followerCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                      {shop.items.length}
                    </span>
                  </div>
                </div>

                {/* 右矢印 */}
                <div className="flex items-center text-text-main/30">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
