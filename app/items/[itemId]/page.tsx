import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";
import FavoriteButton from "./FavoriteButton";
import BackButton from "@/app/components/BackButton";

async function getItemData(itemId: string) {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select(`
      *,
      shops (
        id,
        name,
        owner_id,
        users!shops_owner_id_fkey ( name )
      )
    `)
    .eq("id", itemId)
    .single();

  if (!item) return null;

  const shop = item.shops as unknown as {
    id: string;
    name: string;
    owner_id: string;
    users: { name: string };
  };

  return {
    item,
    shopName: shop?.name || "",
    shopId: shop?.id || "",
    ownerName: shop?.users?.name || "不明",
  };
}

async function getIsFavorited(itemId: string, userId: string | undefined) {
  if (!userId) return false;
  const supabase = await createClient();

  const { data } = await supabase
    .from("item_favorites")
    .select("user_id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .single();

  return !!data;
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const userPromise = getCurrentUser();
  const [itemData, user] = await Promise.all([
    getItemData(itemId),
    userPromise,
  ]);

  if (!itemData) notFound();

  const { item, shopName, shopId, ownerName } = itemData;
  const isFavorited = user ? await getIsFavorited(itemId, user.id) : false;

  return (
    <div className="w-full max-w-md min-h-screen relative flex flex-col bg-bgwarm overflow-hidden shadow-2xl mx-auto">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        {/* Hero Image */}
        <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-100 to-gray-200">
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-12">
            <BackButton
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm text-text-main hover:bg-white transition-transform active:scale-95 shadow-sm"
              icon="arrow_back"
              iconSize={24}
            />
            <button className="flex items-center justify-center w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm text-text-main hover:bg-white transition-transform active:scale-95 shadow-sm">
              <span className="material-symbols-outlined font-bold">
                share
              </span>
            </button>
          </div>
          {item.image_url ? (
            <div className="relative w-full h-full p-4 rounded-bl-[40px] overflow-hidden">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-contain"
              />
              {/* フェードアウトエフェクト */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-100/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-200/30 to-transparent" />
                <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-100/20 to-transparent" />
                <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-gray-100/20 to-transparent" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-bl-[40px]" />
          )}
        </div>

        {/* Item Info */}
        <div className="px-6 pt-10 pb-4">
          <h1 className="text-3xl font-bold text-text-main leading-tight mb-2 font-display tracking-tight">
            {item.name}
          </h1>
          {item.price_range && (
            <p className="text-sm font-semibold text-text-main/80 mt-2">
              {item.price_range}
            </p>
          )}
        </div>

        {/* Owner Comment */}
        {item.comment && (
          <div className="px-6 py-4">
            <div className="relative">
              <div className="bg-sage-light p-6 rounded-2xl relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xs font-bold bg-white/40 text-text-main px-3 py-1 rounded-full uppercase tracking-widest inline-block">
                    オーナーのこだわり
                  </h3>
                  <span className="material-symbols-outlined text-text-main text-3xl">
                    format_quote
                  </span>
                </div>
                <p className="text-text-main text-base font-medium leading-relaxed">
                  &quot;{item.comment}&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 ml-2">
                <div className="w-12 h-12 rounded-full border-2 border-sage p-0.5 bg-white">
                  <div className="w-full h-full rounded-full bg-gray-200" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-text-main uppercase font-display">
                    {ownerName}
                  </span>
                  <Link
                    href={`/shops/${shopId}`}
                    className="text-xs font-medium text-text-main/70 hover:text-sage transition-colors"
                  >
                    {shopName}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-bgwarm border-t border-sage/20 z-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <FavoriteButton itemId={itemId} isFavorited={isFavorited} />
          {item.ec_url ? (
            <a
              href={item.ec_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-14 bg-sage hover:bg-text-main text-bgwarm font-bold font-display text-lg tracking-wide rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>ショップで見る</span>
              <span className="material-symbols-outlined text-[20px]">
                open_in_new
              </span>
            </a>
          ) : (
            <button
              disabled
              className="flex-1 h-14 bg-gray-300 text-gray-500 font-bold font-display text-lg tracking-wide rounded-full flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <span>リンク未設定</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
