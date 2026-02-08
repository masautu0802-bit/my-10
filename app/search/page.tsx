import BottomNav from "@/app/components/BottomNav";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-bgwarm pb-32">
      <div className="max-w-md mx-auto px-4 pt-12">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <span className="material-symbols-outlined text-[48px] text-sage/40">
            search
          </span>
          <h1 className="text-lg font-semibold text-gray-700">さがす</h1>
          <p className="text-sm text-gray-400 text-center">
            検索機能は準備中です
          </p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
