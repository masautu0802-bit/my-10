export default function ShopLoading() {
  return (
    <div className="min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl bg-bgwarm">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-bgwarm border-b border-black/5">
        <div className="size-10 rounded-full bg-sage/15 animate-pulse" />
        <div className="size-10 rounded-full bg-sage/15 animate-pulse" />
      </div>

      <main className="flex-1 pb-32">
        {/* Profile skeleton */}
        <div className="px-6 pt-2 pb-8 flex flex-col items-center text-center">
          <div className="size-28 rounded-full bg-sage/15 animate-pulse mb-5" />
          <div className="h-8 w-40 rounded-full bg-sage/15 animate-pulse mb-4" />
          <div className="h-1 w-15 rounded-full bg-sage/10 mx-auto mb-4" />
          <div className="h-4 w-28 rounded-full bg-sage/10 animate-pulse mb-6" />

          {/* Stats skeleton */}
          <div className="flex gap-10 mb-8 px-8 py-3 rounded-2xl bg-white/60 border border-black/10">
            <div className="flex flex-col items-center gap-1">
              <div className="h-6 w-8 rounded bg-sage/15 animate-pulse" />
              <div className="h-3 w-14 rounded bg-sage/10 animate-pulse" />
            </div>
            <div className="w-px bg-black/10" />
            <div className="flex flex-col items-center gap-1">
              <div className="h-6 w-8 rounded bg-sage/15 animate-pulse" />
              <div className="h-3 w-14 rounded bg-sage/10 animate-pulse" />
            </div>
          </div>

          {/* Follow button skeleton */}
          <div className="h-11 w-36 rounded-full bg-sage/15 animate-pulse" />

          {/* Tags skeleton */}
          <div className="flex gap-2 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-7 w-16 rounded-full bg-sage/10 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Collection header skeleton */}
        <div className="px-6 py-4 border-t border-black/5">
          <div className="h-6 w-32 rounded bg-sage/15 animate-pulse" />
        </div>

        {/* Items grid skeleton */}
        <div className="columns-2 gap-3 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 rounded-2xl bg-sage/10 animate-pulse"
              style={{ height: i % 2 === 0 ? "220px" : "180px" }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
