import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, checkShopOwnership } from "@/app/lib/auth/session";
import BottomNav from "@/app/components/BottomNav";
import ItemList from "./ItemList";
import DeleteShopButton from "./DeleteShopButton";
import BackButton from "@/app/components/BackButton";

async function getShopCMSData(shopId: string) {
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
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
    items: items || [],
    followerCount: followerCount || 0,
  };
}

export default async function ShopCMSPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const isOwner = await checkShopOwnership(shopId);
  if (!isOwner) notFound();

  const data = await getShopCMSData(shopId);
  if (!data) notFound();

  const { shop, items, followerCount } = data;

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col overflow-x-hidden antialiased max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center bg-bgwarm/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-border-light">
        <BackButton
          className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm hover:bg-white active:scale-95 transition-all"
          icon="arrow_back"
          iconSize={24}
        />
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight">
            {shop.name}
          </h2>
          <span className="text-xs font-semibold text-text-main/80 tracking-wide uppercase">
            クリエイタースタジオ
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/cms/shops/${shopId}/edit`}
            className="flex items-center gap-1.5 text-text-main font-semibold text-sm tracking-wide h-10 px-3 rounded-full bg-surface border border-border-light hover:bg-white active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Link>
          <Link
            href={`/cms/shops/${shopId}/settings`}
            className="flex items-center gap-1.5 text-text-main font-semibold text-sm tracking-wide h-10 px-3 rounded-full bg-surface border border-border-light hover:bg-white active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
          </Link>
          <Link
            href={`/shops/${shopId}`}
            className="flex items-center gap-1.5 text-text-main font-semibold text-sm tracking-wide h-10 px-3 rounded-full bg-sage/10 hover:bg-sage/20 active:bg-sage/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
            <span>プレビュー</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col pb-24 px-4">
        {/* Greeting */}
        <div className="mt-6 mb-4">
          <h1 className="text-2xl font-extrabold text-text-main">
            こんにちは、オーナー様！
          </h1>
          <p className="text-text-main text-sm font-medium">
            ショップの準備を始めましょう。
          </p>
          {/* タグ表示 */}
          {shop.tags && shop.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {shop.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-sage/10 text-text-main border border-sage/30 text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <section className="flex flex-wrap gap-3 py-2">
          <div className="relative overflow-hidden flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-surface border border-border-light p-4 items-center text-center shadow-sm hover:shadow-soft transition-all cursor-pointer group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-sage">
                wifi
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-1 bg-sage/10 px-2 py-0.5 rounded-full border border-sage/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage" />
              </span>
              <p className="text-sage text-[10px] font-bold uppercase tracking-wider">
                公開中
              </p>
            </div>
            <p className="text-text-main tracking-tight text-xl font-bold leading-tight">
              オンライン
            </p>
          </div>

          <div className="relative overflow-hidden flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-surface border border-border-light p-4 items-center text-center shadow-sm hover:shadow-soft transition-all cursor-pointer group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-text-main">
                group
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-1 bg-sage/10 px-2 py-0.5 rounded-full border border-border-light">
              <span className="material-symbols-outlined text-text-main/70 text-xs">
                group
              </span>
              <p className="text-text-main text-[10px] font-bold uppercase tracking-wider">
                フォロワー
              </p>
            </div>
            <p className="text-text-main tracking-tight text-xl font-bold leading-tight">
              {followerCount}
            </p>
          </div>

          <div className="relative overflow-hidden flex min-w-[100px] flex-1 basis-[fit-content] flex-col gap-1 rounded-2xl bg-surface border border-border-light p-4 items-center text-center shadow-sm hover:shadow-soft transition-all cursor-pointer group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-4xl text-text-main">
                shopping_bag
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-1 bg-sage/10 px-2 py-0.5 rounded-full border border-border-light">
              <span className="material-symbols-outlined text-text-main/70 text-xs">
                shopping_bag
              </span>
              <p className="text-text-main text-[10px] font-bold uppercase tracking-wider">
                アイテム数
              </p>
            </div>
            <p className="text-text-main tracking-tight text-xl font-bold leading-tight">
              {items.length}
            </p>
          </div>
        </section>

        {/* Item List */}
        <section className="pb-4 pt-6 flex items-end justify-between">
          <div>
            <h3 className="text-text-main tracking-tight text-2xl font-bold leading-tight flex items-center gap-2">
              My Top 10
            </h3>
            <p className="text-text-main text-xs font-semibold mt-1 uppercase tracking-wide opacity-80">
              登録済みアイテム
            </p>
          </div>
          <div className="bg-secondary text-white px-3 py-1.5 rounded-full shadow-sm">
            <p className="text-xs font-bold">
              {items.length} / 10 使用中
            </p>
          </div>
        </section>

        <ItemList initialItems={items} shopId={shopId} />

        {/* Delete Shop Section */}
        <section className="px-4 pb-8">
          <div className="bg-white rounded-2xl p-6 border border-coral/20 shadow-sm">
            <h3 className="text-text-main text-lg font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-coral">
                warning
              </span>
              危険な操作
            </h3>
            <p className="text-text-main/70 text-sm mb-4">
              ショップを削除すると、すべての商品、フォロワー情報も削除されます。この操作は取り消せません。
            </p>
            <DeleteShopButton shopId={shopId} />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
