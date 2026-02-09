import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { getCurrentUser, getCurrentUserProfile } from "@/app/lib/auth/session";
import ProfileForm from "./ProfileForm";

export default async function ProfileEditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentUserProfile();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-bgwarm">
      <header className="flex items-center justify-between px-6 py-5 bg-bgwarm sticky top-0 z-20">
        <Link
          href="/my"
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm hover:scale-105 transition-transform text-text-main border border-sage/50"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back_ios_new
          </span>
        </Link>
        <h1 className="text-xl font-extrabold leading-tight tracking-tight text-text-main">
          プロフィール編集
        </h1>
        <Link
          href="/my"
          className="text-text-muted font-bold text-sm px-2 hover:text-text-main transition-colors"
        >
          キャンセル
        </Link>
      </header>

      <main className="flex-1 flex flex-col gap-8 px-6 pb-32 overflow-y-auto pt-6">
        <ProfileForm
          initialName={profile?.name || ""}
          initialAvatarUrl={profile?.avatar_url}
        />
      </main>

      <BottomNav />
    </div>
  );
}
