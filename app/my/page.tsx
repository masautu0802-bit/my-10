import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, getCurrentUserProfile } from "@/app/lib/auth/session";
import MyPageTabs from "./MyPageTabs";

async function getMyPageData(userId: string) {
  const supabase = await createClient();

  // Get owned shops
  const { data: ownedShops } = await supabase
    .from("shops")
    .select("id, name, theme")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  // Get followed shops
  const { data: follows } = await supabase
    .from("shop_follows")
    .select(`
      shops (
        id,
        name,
        theme
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const followedShops = (follows || [])
    .map((f) => f.shops as unknown as { id: string; name: string; theme: string })
    .filter(Boolean);

  // Get saved items
  const { data: favs } = await supabase
    .from("item_favorites")
    .select(`
      items (
        id,
        name,
        image_url,
        price_range,
        shop_id
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const savedItems = (favs || [])
    .map((f) => f.items as unknown as { id: string; name: string; image_url: string; price_range: string | null; shop_id: string })
    .filter(Boolean);

  return { ownedShops: ownedShops || [], followedShops, savedItems };
}

export default async function MyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [profile, myData] = await Promise.all([
    getCurrentUserProfile(),
    getMyPageData(user.id),
  ]);

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            マイページ
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/my/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 shadow-sm hover:bg-white transition-all text-text-main text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">
                person
              </span>
              {profile?.name || "プロフィール"}
            </Link>
          </div>
        </div>
      </header>

      {/* Owned shops - CMS link */}
      {myData.ownedShops.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-bold text-text-main/50 uppercase tracking-wider mb-2 px-1">
            あなたのショップ
          </p>
          <div className="space-y-2">
            {myData.ownedShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/cms/shops/${shop.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-soft hover:shadow-soft-hover transition-shadow border border-text-main/5"
              >
                <div className="h-10 w-10 rounded-full bg-sage/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sage text-[20px]">
                    storefront
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm leading-tight text-text-main truncate">
                    {shop.name}
                  </h3>
                  <p className="text-[10px] text-gray-400">ショップを管理</p>
                </div>
                <span className="material-symbols-outlined text-sage text-[18px]">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-[57px] z-40 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <MyPageTabs
          followedShops={myData.followedShops}
          savedItems={myData.savedItems}
        />
      </div>

      <BottomNav />
    </div>
  );
}
