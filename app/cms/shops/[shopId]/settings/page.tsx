import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser, checkShopOwnership } from "@/app/lib/auth/session";
import BottomNav from "@/app/components/BottomNav";
import ShopSettingsForm from "./ShopSettingsForm";
import BackButton from "@/app/components/BackButton";

async function getShop(shopId: string) {
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();

  return shop;
}

async function getColorThemes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("color_themes")
    .select("*")
    .order("display_order", { ascending: true });

  return data || [];
}

export default async function ShopSettingsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const isOwner = await checkShopOwnership(shopId);
  if (!isOwner) notFound();

  const shop = await getShop(shopId);
  if (!shop) notFound();

  const colorThemes = await getColorThemes();

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
            ショップ設定
          </h2>
          <span className="text-xs font-semibold text-text-main/80 tracking-wide uppercase">
            Shop Settings
          </span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col pb-24 px-4">
        <div className="mt-6 mb-4">
          <h1 className="text-2xl font-extrabold text-text-main">
            カスタマイズ設定
          </h1>
          <p className="text-text-main text-sm font-medium mt-1">
            ショップの見た目をカスタマイズしましょう。
          </p>
        </div>

        <ShopSettingsForm shop={shop} colorThemes={colorThemes} />
      </main>

      <BottomNav />
    </div>
  );
}
