import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, checkShopOwnership } from "@/app/lib/auth/session";

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
        <Link
          href="/"
          className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm hover:bg-white active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">
            arrow_back
          </span>
        </Link>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight">
            {shop.name}
          </h2>
          <span className="text-xs font-semibold text-text-main/80 tracking-wide uppercase">
            クリエイタースタジオ
          </span>
        </div>
        <Link
          href={`/shops/${shopId}`}
          className="flex items-center justify-end text-text-main font-semibold text-sm tracking-wide h-10 px-3 rounded-full hover:bg-surface active:bg-surface/80 transition-colors"
        >
          プレビュー
        </Link>
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

        <section className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`group flex items-center gap-4 bg-surface p-3 pr-4 rounded-2xl border shadow-sm hover:shadow-soft transition-all ${
                i === 0
                  ? "border-sage/30 shadow-soft scale-[1.01] z-10 relative"
                  : "border-transparent"
              }`}
            >
              <div className="aspect-square rounded-xl size-16 shrink-0 bg-gray-100 border border-gray-100 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      i === 0
                        ? "bg-sage/20 text-text-main"
                        : "bg-gray-100 text-text-main"
                    }`}
                  >
                    #{i + 1}
                  </span>
                </div>
                <p className="text-text-main text-base font-bold truncate">
                  {item.name}
                </p>
                <p className="text-text-main text-sm font-semibold">
                  {item.price_range || "価格未設定"}
                </p>
              </div>
              <div
                className={`shrink-0 p-2 transition-colors ${
                  i === 0
                    ? "bg-sage/20 text-text-main rounded-lg"
                    : "text-gray-300 group-hover:text-sage"
                }`}
              >
                <span className="material-symbols-outlined">
                  {i === 0 ? "drag_pan" : "drag_indicator"}
                </span>
              </div>
            </div>
          ))}

          {items.length < 10 && (
            <button className="flex items-center justify-center gap-3 bg-surface/50 border-2 border-dashed border-border-light p-4 rounded-2xl h-24 group hover:border-sage transition-all">
              <div className="flex items-center justify-center size-10 rounded-full bg-white text-text-main group-hover:bg-sage group-hover:text-white transition-all transform group-hover:scale-105 shadow-sm">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <span className="text-sm font-bold text-text-main group-hover:text-sage transition-colors">
                枠 #{items.length + 1} を埋める
              </span>
            </button>
          )}
          <div className="h-8" />
        </section>
      </main>

      {/* CMS specific bottom nav */}
      <nav className="fixed bottom-0 z-30 w-full border-t border-border-light bg-bgwarm/95 backdrop-blur rounded-t-3xl shadow-[0_-5px_15px_rgba(162,178,159,0.1)] max-w-md mx-auto">
        <div className="flex h-20 items-center justify-around px-2">
          <div className="flex flex-col items-center justify-center gap-1 w-16">
            <div className="p-1 rounded-xl">
              <span className="material-symbols-outlined text-sage">
                dashboard
              </span>
            </div>
            <span className="text-[10px] font-bold text-sage">ホーム</span>
          </div>
          <div className="-mt-8">
            <Link
              href={`/shops/${shopId}`}
              className="flex flex-col items-center justify-center gap-1 w-16"
            >
              <div className="size-14 flex items-center justify-center rounded-full bg-sage shadow-soft hover:shadow-soft-hover border-4 border-bgwarm transform transition-transform active:scale-95 text-white">
                <span className="material-symbols-outlined text-2xl">
                  storefront
                </span>
              </div>
            </Link>
          </div>
          <Link
            href="/my"
            className="flex flex-col items-center justify-center gap-1 w-16 group"
          >
            <div className="p-1 rounded-xl group-hover:bg-sage/10 transition-colors">
              <span className="material-symbols-outlined text-sage">
                settings
              </span>
            </div>
            <span className="text-[10px] font-bold text-sage">設定</span>
          </Link>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
