import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, getCurrentUserProfile } from "@/app/lib/auth/session";
import MyPageTabs from "./MyPageTabs";

async function getMyPageData(userId: string) {
  const supabase = await createClient();

  // Get followed shops
  const { data: follows } = await supabase
    .from("shop_follows")
    .select(`
      shops (
        id,
        name
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const followedShops = await Promise.all(
    (follows || [])
      .map((f) => f.shops as unknown as { id: string; name: string })
      .filter(Boolean)
      .map(async (shop) => {
        // Get first item image for each shop
        const { data: items } = await supabase
          .from("items")
          .select("image_url")
          .eq("shop_id", shop.id)
          .order("order_index", { ascending: true })
          .limit(1);

        return {
          ...shop,
          first_item_image: items?.[0]?.image_url || null,
        };
      })
  );

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

  return { followedShops, savedItems };
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
