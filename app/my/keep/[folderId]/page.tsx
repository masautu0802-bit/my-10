import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";
import BottomNav from "@/app/components/BottomNav";
import BackButton from "@/app/components/BackButton";
import KeepFolderDetail from "./KeepFolderDetail";

async function getKeepFolderData(folderId: string, userId: string) {
  const supabase = await createClient();

  const { data: folder } = await supabase
    .from("keep_folders")
    .select("id, name, user_id")
    .eq("id", folderId)
    .single();

  if (!folder || folder.user_id !== userId) return null;

  const { data: folderItems } = await supabase
    .from("keep_folder_items")
    .select(`
      item_id,
      created_at,
      items (
        id,
        name,
        image_url,
        price_range,
        shop_id,
        shops (
          name
        )
      )
    `)
    .eq("folder_id", folderId)
    .order("created_at", { ascending: false });

  const items = (folderItems || [])
    .map((fi: any) => {
      const item = fi.items;
      if (!item) return null;
      return {
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        price_range: item.price_range,
        shop_name: item.shops?.name || null,
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      name: string;
      image_url: string | null;
      price_range: string | null;
      shop_name: string | null;
    }>;

  return {
    id: folder.id,
    name: folder.name,
    items,
  };
}

export default async function KeepFolderPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { folderId } = await params;
  const folder = await getKeepFolderData(folderId, user.id);
  if (!folder) redirect("/my");

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton />
          <h1 className="text-lg font-extrabold tracking-tight text-text-main truncate flex-1">
            {folder.name}
          </h1>
        </div>
      </header>

      <KeepFolderDetail folder={folder} />

      <BottomNav />
    </div>
  );
}
