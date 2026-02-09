export default function MyPageLoading() {
  return (
    <div className="bg-bgwarm min-h-screen flex flex-col antialiased max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-extrabold tracking-tight text-text-main">
            マイページ
          </h1>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 rounded-full bg-sage/15 animate-pulse" />
            <div className="size-8 rounded-full bg-sage/15 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Tabs skeleton */}
      <div className="sticky top-[57px] z-40 bg-bgwarm/95 backdrop-blur-md border-b border-text-main/10">
        <div className="flex px-5 py-3 gap-4">
          <div className="h-8 w-28 rounded-full bg-sage/15 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-sage/10 animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm"
          >
            <div className="size-16 rounded-xl bg-sage/10 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-full bg-sage/15 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-sage/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
