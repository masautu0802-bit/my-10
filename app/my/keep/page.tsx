import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";
import KeepTabs from "./KeepTabs";

async function getKeepData(userId: string) {
  const supabase = await createClient();

  // Get saved items (favorites)
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

  return { savedItems, keepFolders };
}

export default async function KeepPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const data = await getKeepData(user.id);

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="px-5 py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            キープ
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <KeepTabs
          savedItems={data.savedItems}
          keepFolders={data.keepFolders}
        />
      </div>

      <BottomNav />
    </div>
  );
}
