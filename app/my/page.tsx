import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, getCurrentUserProfile } from "@/app/lib/auth/session";
import MyPageTabs from "./MyPageTabs";
import LogoutButton from "./LogoutButton";

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

  const shopList = (follows || [])
    .map((f) => f.shops as unknown as { id: string; name: string })
    .filter(Boolean);

  const shopIds = shopList.map((s) => s.id);

  // Batch: get first item images for all followed shops in one query
  let allItems: Array<{ shop_id: string; image_url: string | null; order_index: number }> = [];
  if (shopIds.length > 0) {
    const { data } = await supabase
      .from("items")
      .select("shop_id, image_url, order_index")
      .in("shop_id", shopIds)
      .order("order_index", { ascending: true });
    allItems = data || [];
  }

  const firstItemImageMap: Record<string, string | null> = {};
  allItems.forEach((item) => {
    if (!(item.shop_id in firstItemImageMap)) {
      firstItemImageMap[item.shop_id] = item.image_url;
    }
  });

  const followedShops = shopList.map((shop) => ({
    ...shop,
    first_item_image: firstItemImageMap[shop.id] || null,
  }));

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

  // Get keep folders with item count and preview thumbnails
  const { data: folders } = await supabase
    .from("keep_folders")
    .select(`
      id,
      name,
      created_at,
      keep_folder_items (
        item_id,
        items (
          id,
          image_url
        )
      )
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  const keepFolders = (folders || []).map((folder) => {
    const items = (folder.keep_folder_items || [])
      .map((fi: any) => fi.items)
      .filter(Boolean);
    return {
      id: folder.id,
      name: folder.name,
      item_count: items.length,
      preview_images: items.slice(0, 3).map((item: any) => item.image_url).filter(Boolean) as string[],
    };
  });

  return { followedShops, savedItems, keepFolders };
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
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="sticky top-[57px] z-40 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <MyPageTabs
          followedShops={myData.followedShops}
          savedItems={myData.savedItems}
          keepFolders={myData.keepFolders}
        />
      </div>

      <BottomNav />
    </div>
  );
}
