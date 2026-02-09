import { redirect } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import { getCurrentUser, getCurrentUserProfile } from "@/app/lib/auth/session";
import ProfileForm from "./ProfileForm";
import ProfileHeader from "./ProfileHeader";

export default async function ProfileEditPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentUserProfile();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-bgwarm">
      <ProfileHeader />

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
