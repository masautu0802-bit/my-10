export default function ItemLoading() {
  return (
    <div className="w-full max-w-md min-h-screen relative flex flex-col bg-bgwarm overflow-hidden shadow-2xl mx-auto">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        {/* Hero Image skeleton */}
        <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-100 to-gray-200 animate-pulse">
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pt-12">
            <div className="w-11 h-11 rounded-full bg-white/60" />
            <div className="w-11 h-11 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Item Info skeleton */}
        <div className="px-6 pt-10 pb-4 space-y-3">
          <div className="h-8 w-3/4 rounded-lg bg-sage/15 animate-pulse" />
          <div className="h-4 w-24 rounded bg-sage/10 animate-pulse" />
        </div>

        {/* Comment skeleton */}
        <div className="px-6 py-4">
          <div className="bg-sage-light/50 p-6 rounded-2xl animate-pulse">
            <div className="h-5 w-32 rounded-full bg-white/40 mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-white/30" />
              <div className="h-4 w-4/5 rounded bg-white/30" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 ml-2">
            <div className="w-12 h-12 rounded-full bg-sage/15 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-20 rounded bg-sage/15 animate-pulse" />
              <div className="h-3 w-28 rounded bg-sage/10 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-bgwarm border-t border-sage/20 z-50">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-sage/15 animate-pulse" />
          <div className="flex-1 h-14 rounded-full bg-sage/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
