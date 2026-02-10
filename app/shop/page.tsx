import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";

export default async function ShopHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const { data: ownedShops } = await supabase
    .from("shops")
    .select("id, name, theme")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            ショップ
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 pb-[var(--bottom-nav-safe)]">
        {/* Owned shops */}
        {ownedShops && ownedShops.length > 0 ? (
          <div className="pt-4 pb-2">
            <p className="text-xs font-bold text-text-main/50 uppercase tracking-wider mb-3 px-1">
              あなたのショップ
            </p>
            <div className="space-y-2">
              {ownedShops.map((shop) => (
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
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-sage/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-sage text-[32px]">
                storefront
              </span>
            </div>
            <div>
              <p className="text-text-main font-bold text-base">
                まだショップがありません
              </p>
              <p className="text-text-muted text-sm mt-1">
                あなたのショップを作成して商品を出品しましょう
              </p>
            </div>
          </div>
        )}

        {/* Create shop button */}
        <div className="mt-6 px-1">
          <Link
            href="/shop/create"
            className="flex items-center justify-center gap-2 w-full bg-text-main hover:bg-text-main/90 text-white font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-text-main/20 transition-all active:scale-[0.98] active:shadow-none"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>新しいショップを出店する</span>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
