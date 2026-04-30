export default function WordsLoading() {
  return (
    <div className="py-4 space-y-4 lg:py-0 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="shimmer-bar bg-surface-container-high h-8 w-32 rounded-2xl" />
          <div className="shimmer-bar bg-surface-container-high h-3 w-64 rounded-full hidden lg:block" />
        </div>
        <div className="flex gap-2">
          <div className="shimmer-bar bg-surface-container-high h-9 w-24 rounded-2xl" />
          <div className="shimmer-bar bg-surface-container-high h-9 w-24 rounded-2xl" />
        </div>
      </div>

      {/* Search + tag filters */}
      <div className="space-y-3 lg:bg-surface-container-lowest lg:rounded-3xl lg:p-5 lg:space-y-4">
        <div className="shimmer-bar bg-surface-container-high h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer-bar bg-surface-container-high h-7 w-16 rounded-full" />
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="shimmer-bar bg-surface-container-high h-3 w-16 rounded-full" />

      {/* Word cards grid */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 lg:p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 flex-1 min-w-0 mr-2">
                <div className="flex items-center gap-2">
                  <div className="shimmer-bar bg-surface-container-high h-5 w-28 rounded-xl" />
                  <div className="shimmer-bar bg-surface-container-high h-4 w-12 rounded-full" />
                </div>
                <div className="shimmer-bar bg-surface-container-high h-3.5 w-44 rounded-full" />
              </div>
              <div className="flex gap-1 shrink-0">
                <div className="shimmer-bar bg-surface-container-high w-8 h-8 rounded-xl" />
                <div className="shimmer-bar bg-surface-container-high w-8 h-8 rounded-xl" />
                <div className="shimmer-bar bg-surface-container-high w-8 h-8 rounded-xl" />
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container-high space-y-1.5">
              <div className="shimmer-bar bg-surface-container-high h-3 w-full rounded-full" />
              <div className="shimmer-bar bg-surface-container-high h-3 w-3/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
