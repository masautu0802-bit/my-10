export default function HomeLoading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-[#E5E7EB] shadow-2xl">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-bgwarm">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg px-6 py-5 border-b border-sage/10 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-black mb-1 text-sage/60">
              <span className="material-symbols-outlined text-[10px]">
                location_on
              </span>
              <span>Your Shopping Street</span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-3 text-[#2a2a2a]">
              My10
              <span className="h-1 w-8 rounded-full bg-coral/30 mt-1"></span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="material-symbols-outlined text-[20px] text-[#2a2a2a]">search</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="material-symbols-outlined text-[20px] text-[#2a2a2a]">notifications</span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-28">
          {/* Category tags skeleton */}
          <div className="px-4 py-6">
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 h-24 rounded-2xl bg-sage/10 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Shop cards skeleton */}
          <div className="px-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-full bg-sage/15 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded-full bg-sage/15 animate-pulse" />
                    <div className="h-3 w-20 rounded-full bg-sage/10 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="aspect-square rounded-2xl bg-sage/10 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
