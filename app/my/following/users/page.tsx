import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import BackButton from "@/app/components/BackButton";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUser } from "@/app/lib/auth/session";

async function getFollowingUsers(userId: string) {
  const supabase = await createClient();

  const { data: follows } = await supabase
    .from("user_follows")
    .select(`
      created_at,
      users!user_follows_followee_id_fkey (
        id,
        name,
        avatar_url,
        bio
      )
    `)
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });

  const userList = (follows || [])
    .map((f) => {
      const userData = f.users as unknown as {
        id: string;
        name: string;
        avatar_url: string | null;
        bio?: string | null;
      };
      return {
        followedAt: f.created_at,
        ...userData,
        bio: userData.bio ?? null,
      };
    })
    .filter(Boolean);

  const userIds = userList.map((u) => u.id);

  // 各ユーザーのフォロワー数を取得
  const { data: followerCounts } = await supabase
    .from("user_follows")
    .select("followee_id")
    .in("followee_id", userIds);

  const followerCountMap: Record<string, number> = {};
  followerCounts?.forEach((fc) => {
    followerCountMap[fc.followee_id] = (followerCountMap[fc.followee_id] || 0) + 1;
  });

  // 各ユーザーのショップ数を取得
  const { data: shops } = await supabase
    .from("shops")
    .select("owner_id")
    .in("owner_id", userIds);

  const shopCountMap: Record<string, number> = {};
  shops?.forEach((shop) => {
    shopCountMap[shop.owner_id] = (shopCountMap[shop.owner_id] || 0) + 1;
  });

  return userList.map((user) => ({
    ...user,
    followerCount: followerCountMap[user.id] || 0,
    shopCount: shopCountMap[user.id] || 0,
  }));
}

export default async function FollowingUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const users = await getFollowingUsers(user.id);

  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center gap-3 px-5 py-4">
          <BackButton />
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            フォロー中
          </h1>
        </div>
      </header>

      <main className="flex-1 pb-24 px-5 py-6">
        {users.length === 0 ? (
          <div className="text-center py-16 text-text-main/60">
            <span className="material-symbols-outlined text-[48px] mb-4 block">group</span>
            <p className="text-sm font-medium mb-2">フォロー中のユーザーがいません</p>
            <p className="text-xs mb-4">気になるユーザーをフォローしてみましょう</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-4 py-2 bg-sage text-white rounded-full text-sm font-bold hover:bg-sage/90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>ユーザーを探す</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((followedUser) => (
              <Link
                key={followedUser.id}
                href={`/users/${followedUser.id}`}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-sage/20 hover:border-sage/40 hover:shadow-md transition-all"
              >
                {/* アバター */}
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-sage/20">
                  {followedUser.avatar_url ? (
                    <Image
                      src={followedUser.avatar_url}
                      alt={followedUser.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-[28px]">person</span>
                    </div>
                  )}
                </div>

                {/* ユーザー情報 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-main text-base truncate mb-1">
                    {followedUser.name}
                  </h3>
                  {followedUser.bio && (
                    <p className="text-xs text-text-main/70 line-clamp-1 mb-2">
                      {followedUser.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-text-main/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">storefront</span>
                      {followedUser.shopCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      {followedUser.followerCount}
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
      </main>

      <BottomNav />
    </div>
  );
}
