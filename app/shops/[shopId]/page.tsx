import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";
import FollowButton from "./FollowButton";
import UserFollowButton from "./UserFollowButton";
import ShopItemsWithPriceUpdate from "./ShopItemsWithPriceUpdate";
import {
  parseColorTheme,
  getContrastTextColor,
} from "@/app/lib/shop-customization";
import { getFontUrl } from "@/app/lib/fonts";
import BackButton from "@/app/components/BackButton";

async function getShopData(shopId: string) {
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select(`
      *,
      users!shops_owner_id_fkey ( name, avatar_url )
    `)
    .eq("id", shopId)
    .single();

  if (!shop) return null;

  const [{ data: items }, { count: followerCount }] = await Promise.all([
    supabase
      .from("items")
      .select("*")
      .eq("shop_id", shopId)
      .order("order_index", { ascending: true }),
    supabase
      .from("shop_follows")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId),
  ]);

  const owner = shop.users as unknown as { name: string; avatar_url?: string | null };

  return {
    shop,
    ownerName: owner?.name || "不明",
    ownerAvatarUrl: owner?.avatar_url || null,
    items: items || [],
    followerCount: followerCount || 0,
  };
}

async function getFollowState(shopId: string, ownerId: string, userId: string | undefined) {
  if (!userId) return { isFollowing: false, isFollowingOwner: false, favorites: new Set<string>() };
  const supabase = await createClient();

  const [{ data: follow }, { data: ownerFollow }, { data: favs }] = await Promise.all([
    supabase
      .from("shop_follows")
      .select("user_id")
      .eq("user_id", userId)
      .eq("shop_id", shopId)
      .single(),
    supabase
      .from("user_follows")
      .select("follower_id")
      .eq("follower_id", userId)
      .eq("followee_id", ownerId)
      .single(),
    supabase
      .from("item_favorites")
      .select("item_id")
      .eq("user_id", userId),
  ]);

  return {
    isFollowing: !!follow,
    isFollowingOwner: !!ownerFollow,
    favorites: new Set(favs?.map((f) => f.item_id) || []),
  };
}

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const [shopData, user] = await Promise.all([
    getShopData(shopId),
    getCurrentUser(),
  ]);

  if (!shopData) notFound();

  const { shop, ownerName, ownerAvatarUrl, items, followerCount } = shopData;
  const { isFollowing, isFollowingOwner, favorites } = await getFollowState(shopId, shop.owner_id, user?.id);
  const isOwner = user?.id === shop.owner_id;

  // カスタマイズ設定を取得
  const colorTheme = parseColorTheme(shop.color_theme);
  const fontFamily = shop.font_family || "Noto Sans JP";
  const fontUrl = getFontUrl(fontFamily);

  // テーマに基づく色設定
  const isDark = colorTheme?.isDark || false;
  const textColor = isDark ? "#FFFFFF" : "#2C3E50";
  const textColorSecondary = isDark ? "#E0E0E0" : "#5A6C7D";
  const bgPrimary = colorTheme?.primary || "#FFF8F0";
  const bgSecondary = colorTheme?.secondary || "#FFF2EB";
  const bgTertiary = colorTheme?.tertiary || "#FFE8CD";
  const bgQuaternary = colorTheme?.quaternary || "#FFD6BA";

  // 各背景色に対する適切なテキスト色を計算
  const textOnQuaternary = getContrastTextColor(bgQuaternary);
  const textOnTertiary = getContrastTextColor(bgTertiary);
  const textOnSecondary = getContrastTextColor(bgSecondary);

  return (
    <>
      {/* Google Fontsの読み込み */}
      <link rel="stylesheet" href={fontUrl} />

      <div
        className="min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl"
        style={{ backgroundColor: bgPrimary, color: textColor }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-50 flex items-center justify-between p-4 backdrop-blur-md transition-all"
          style={{
            backgroundColor: `${bgPrimary}E6`,
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
          }}
        >
          <BackButton
            className="flex items-center justify-center size-10 rounded-full shadow-sm hover:opacity-80 transition-all"
            style={{
              backgroundColor: `${bgQuaternary}CC`,
              color: textOnQuaternary,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
            }}
            iconStyle={{ color: textOnQuaternary }}
          />
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href={`/cms/shops/${shopId}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:opacity-80 transition-all"
                style={{
                  backgroundColor: `${bgTertiary}99`,
                  color: textOnTertiary,
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
                }}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: textOnTertiary }}
                >
                  edit_square
                </span>
                <span className="text-xs font-bold" style={{ color: textOnTertiary }}>
                  管理
                </span>
              </Link>
            )}
            <button
              className="flex items-center justify-center size-10 rounded-full shadow-sm hover:opacity-80 transition-all"
              style={{
                backgroundColor: `${bgQuaternary}CC`,
                color: textOnQuaternary,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
              }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: textOnQuaternary }}
              >
                ios_share
              </span>
            </button>
          </div>
        </div>

        <main className="flex-1 pb-32">
          {/* 背景のグラデーション */}
          <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10 pointer-events-none">
            <div
              className="absolute -top-10 -right-10 w-80 h-80 rounded-full blur-3xl"
              style={{
                backgroundColor: bgSecondary,
                opacity: isDark ? 0.3 : 0.6,
              }}
            />
            <div
              className="absolute top-10 -left-10 w-72 h-72 rounded-full blur-3xl"
              style={{
                backgroundColor: bgTertiary,
                opacity: isDark ? 0.3 : 0.6,
              }}
            />
          </div>

          {/* Shop Profile */}
          <div className="px-6 pt-2 pb-8 flex flex-col items-center text-center relative">
            {/* プロフィール画像 */}
            <div className="relative group cursor-pointer mb-5">
              <div
                className="size-28 rounded-full p-1"
                style={{
                  border: `2px solid ${bgQuaternary}`,
                  backgroundColor: `${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)"}`,
                }}
              >
                <div
                  className="size-full rounded-full overflow-hidden"
                  style={{
                    backgroundColor: isDark ? "#555" : "#E0E0E0",
                  }}
                >
                  {ownerAvatarUrl ? (
                    <Image
                      src={ownerAvatarUrl}
                      alt={ownerName}
                      width={112}
                      height={112}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div
                      className="size-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDark ? "#555" : "#E0E0E0",
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-4xl"
                        style={{
                          color: isDark ? "#888" : "#AAA",
                        }}
                      >
                        person
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="absolute bottom-0 right-0 rounded-full p-1 shadow-sm"
                style={{
                  backgroundColor: bgTertiary,
                  border: `2px solid ${bgPrimary}`,
                  color: textOnTertiary,
                }}
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: textOnTertiary }}
                >
                  verified
                </span>
              </div>
            </div>

            {/* ショップ名 */}
            <div className="mb-4 relative">
              <h1
                className="text-4xl font-black tracking-tight mb-4 relative z-10"
                style={{
                  fontFamily,
                  color: textColor,
                  textShadow: isDark
                    ? "0 2px 8px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                  letterSpacing: "-0.02em",
                }}
              >
                {shop.name}
              </h1>
              {/* 装飾的なアンダーライン */}
              <div
                className="h-1 rounded-full mx-auto"
                style={{
                  width: "60px",
                  backgroundColor: bgQuaternary,
                  opacity: 0.8,
                }}
              />
            </div>

            {/* オーナー情報 */}
            <Link
              href={`/users/${shop.owner_id}`}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-4 hover:opacity-80 transition-all group"
              style={{
                backgroundColor: `${bgSecondary}66`,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
              }}
            >
              <div
                className="size-8 rounded-full overflow-hidden border-2"
                style={{
                  borderColor: bgQuaternary,
                  backgroundColor: isDark ? "#555" : "#E0E0E0",
                }}
              >
                {ownerAvatarUrl ? (
                  <Image
                    src={ownerAvatarUrl}
                    alt={ownerName}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="size-full flex items-center justify-center"
                    style={{
                      backgroundColor: isDark ? "#555" : "#E0E0E0",
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{
                        color: isDark ? "#888" : "#AAA",
                      }}
                    >
                      person
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start">
                <p
                  className="text-[10px] font-medium uppercase tracking-wider leading-tight"
                  style={{ color: textColorSecondary, opacity: 0.7 }}
                >
                  Owner
                </p>
                <p
                  className="text-sm font-bold leading-tight"
                  style={{ color: textColor }}
                >
                  {ownerName}
                </p>
              </div>
              <span
                className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-0.5 transition-transform"
                style={{ color: textColorSecondary }}
              >
                chevron_right
              </span>
            </Link>

            {/* 統計情報 */}
            <div
              className="flex gap-10 mb-8 text-sm px-8 py-3 rounded-2xl shadow-soft"
              style={{
                backgroundColor: `${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)"}`,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-lg" style={{ color: textColor }}>
                  {followerCount}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: textColorSecondary }}
                >
                  フォロワー
                </span>
              </div>
              <div
                className="w-px h-auto"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.2)",
                }}
              />
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-lg" style={{ color: textColor }}>
                  {items.length}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: textColorSecondary }}
                >
                  アイテム
                </span>
              </div>
            </div>

            {/* フォローボタンセクション */}
            <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto mb-4">
              {/* オーナーをフォローするボタン */}
              {user && (
                <div className="w-full flex flex-col items-center gap-1.5">
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: textColorSecondary }}
                  >
                    オーナーをフォロー
                  </span>
                  <UserFollowButton
                    userId={shop.owner_id}
                    isFollowing={isFollowingOwner}
                    primaryColor={bgPrimary}
                    tertiaryColor={bgTertiary}
                    isDark={isDark}
                  />
                </div>
              )}

              {/* 店をフォローするボタン */}
              <div className="w-full flex flex-col items-center gap-1.5">
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: textColorSecondary }}
                >
                  ショップをフォロー
                </span>
                <FollowButton
                  shopId={shopId}
                  isFollowing={isFollowing}
                  primaryColor={bgPrimary}
                  quaternaryColor={bgQuaternary}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* タグ表示 */}
            {shop.tags && shop.tags.length > 0 && (
              <div className="flex gap-2 mt-8 flex-wrap justify-center">
                {shop.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
                    style={{
                      backgroundColor: `${bgTertiary}99`,
                      color: textOnTertiary,
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 説明文 */}
            {shop.description && (
              <div className="relative max-w-md mx-auto px-4 mt-6">
                <p
                  className="text-sm leading-relaxed text-center italic"
                  style={{ color: textColorSecondary }}
                >
                  &quot;{shop.description}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Collection header */}
          <div
            className="px-6 py-4 flex items-center justify-between sticky top-[72px] z-30 backdrop-blur-md"
            style={{
              backgroundColor: `${bgPrimary}F2`,
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
            }}
          >
            <h3
              className="text-lg font-bold tracking-tight flex items-center gap-2"
              style={{ color: textColor }}
            >
              コレクション
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${bgQuaternary}CC`,
                  color: textOnQuaternary,
                }}
              >
                {items.length} アイテム
              </span>
            </h3>
          </div>

          {/* Masonry Grid */}
          <ShopItemsWithPriceUpdate initialItems={items} favorites={favorites} />
        </main>

        <BottomNav />
      </div>
    </>
  );
}
