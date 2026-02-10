import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";
import LogoutButton from "./LogoutButton";

async function getProfileData(userId: string) {
  const supabase = await createClient();

  // ユーザー情報取得
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, avatar_url, bio")
    .eq("id", userId)
    .single();

  if (!user) return null;

  // bioカラムが存在しない場合のフォールバック
  const userWithBio = {
    ...user,
    bio: user.bio ?? null,
  };

  // フォロー中ユーザー数
  const { count: followingUsersCount } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  // フォロワー数
  const { count: followersCount } = await supabase
    .from("user_follows")
    .select("*", { count: "exact", head: true })
    .eq("followee_id", userId);

  // フォロー中ショップ数
  const { count: followingShopsCount } = await supabase
    .from("shop_follows")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // 所有ショップ取得（ショップフォロワー数順）
  const { data: shops } = await supabase
    .from("shops")
    .select("id, name, theme")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  const shopIds = shops?.map((s) => s.id) || [];

  // ショップフォロワー数を取得
  const { data: shopFollows } = await supabase
    .from("shop_follows")
    .select("shop_id")
    .in("shop_id", shopIds);

  const shopFollowerCounts: Record<string, number> = {};
  shopFollows?.forEach((sf) => {
    shopFollowerCounts[sf.shop_id] = (shopFollowerCounts[sf.shop_id] || 0) + 1;
  });

  // ショップごとの最初の3商品を取得
  const { data: allItems } = await supabase
    .from("items")
    .select("id, name, image_url, shop_id, order_index")
    .in("shop_id", shopIds)
    .order("order_index", { ascending: true });

  const itemsByShop: Record<string, Array<{ id: string; name: string; image_url: string | null }>> = {};
  shopIds.forEach((id) => (itemsByShop[id] = []));
  allItems?.forEach((item) => {
    const list = itemsByShop[item.shop_id];
    if (list && list.length < 3) {
      list.push({ id: item.id, name: item.name, image_url: item.image_url });
    }
  });

  const ownedShops = (shops || []).map((shop) => ({
    ...shop,
    followerCount: shopFollowerCounts[shop.id] || 0,
    items: itemsByShop[shop.id] || [],
  })).sort((a, b) => b.followerCount - a.followerCount);

  // ショップフォロワー合計数
  const totalShopFollowers = Object.values(shopFollowerCounts).reduce((sum, count) => sum + count, 0);

  return {
    user: userWithBio,
    followingUsersCount: followingUsersCount || 0,
    followersCount: followersCount || 0,
    followingShopsCount: followingShopsCount || 0,
    totalShopFollowers,
    ownedShops,
  };
}

export default async function MyPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/auth/login");

  const profileData = await getProfileData(currentUser.id);
  if (!profileData) redirect("/auth/login");

  const { user, followingUsersCount, followersCount, followingShopsCount, totalShopFollowers, ownedShops } = profileData;

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            {user.name}
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/my/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 shadow-sm hover:bg-white transition-all text-text-main text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>編集</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 px-5">
        {/* プロフィールセクション */}
        <div className="py-6 border-b border-text-main/10">
          <div className="flex items-center gap-5 mb-5">
            {/* アバター */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-sage/30">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-[40px]">person</span>
                </div>
              )}
            </div>

            {/* 統計 */}
            <div className="flex-1 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-text-main">{ownedShops.length}</div>
                <div className="text-[10px] text-text-main/60 font-medium">ショップ</div>
              </div>
              <Link href="/my/following/users" className="hover:opacity-70 transition-opacity">
                <div className="text-xl font-bold text-text-main">{followingUsersCount}</div>
                <div className="text-[10px] text-text-main/60 font-medium">フォロー中</div>
              </Link>
              <div>
                <div className="text-xl font-bold text-text-main">{followersCount}</div>
                <div className="text-[10px] text-text-main/60 font-medium">フォロワー</div>
              </div>
            </div>
          </div>

          {/* 自己紹介 */}
          {user.bio && (
            <p className="text-sm text-text-main mb-3 whitespace-pre-wrap">{user.bio}</p>
          )}

          {/* ショップ統計 */}
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/my/following/shops"
              className="flex items-center gap-1.5 text-text-main/70 hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              <span className="font-semibold">{followingShopsCount}</span>
              <span className="text-xs">店フォロー中</span>
            </Link>
            <div className="flex items-center gap-1.5 text-text-main/70">
              <span className="material-symbols-outlined text-[16px]">favorite</span>
              <span className="font-semibold">{totalShopFollowers}</span>
              <span className="text-xs">店フォロワー</span>
            </div>
          </div>
        </div>

        {/* 所有ショップ一覧 */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-main">ショップ</h2>
            <Link
              href="/shop/create"
              className="flex items-center gap-1 text-sage text-sm font-bold hover:opacity-70 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>新規作成</span>
            </Link>
          </div>

          {ownedShops.length === 0 ? (
            <div className="text-center py-12 text-text-main/60">
              <span className="material-symbols-outlined text-[48px] mb-2 block">storefront</span>
              <p className="text-sm font-medium mb-3">まだショップがありません</p>
              <Link
                href="/shop/create"
                className="inline-flex items-center gap-1 px-4 py-2 bg-sage text-white rounded-full text-sm font-bold hover:bg-sage/90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>ショップを作成</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ownedShops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/cms/shops/${shop.id}`}
                  className="flex gap-3 p-4 bg-white rounded-2xl border border-sage/20 hover:border-sage/40 hover:shadow-md transition-all"
                >
                  {/* ショップ画像プレビュー */}
                  <div className="grid grid-cols-3 gap-1 w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {shop.items.slice(0, 3).map((item, idx) => (
                      <div key={item.id} className="relative bg-gray-50">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                    ))}
                    {Array.from({ length: 3 - shop.items.length }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-gray-200" />
                    ))}
                  </div>

                  {/* ショップ情報 */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-text-main text-base truncate mb-1">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-main/60">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                        {shop.followerCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                        {shop.items.length}
                      </span>
                    </div>
                  </div>

                  {/* 右矢印 */}
                  <div className="flex items-center text-text-main/30">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
