export default function StatsLoading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="shimmer-bar bg-surface-container-high h-3 w-20 rounded-full" />
        <div className="shimmer-bar bg-surface-container-high h-9 w-52 rounded-2xl" />
      </div>

      {/* Level card placeholder */}
      <div className="shimmer-bar bg-surface-container-high h-36 lg:h-44 w-full rounded-3xl" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 lg:p-5 space-y-3">
            <div className="shimmer-bar bg-surface-container-high w-9 h-9 lg:w-11 lg:h-11 rounded-xl" />
            <div className="shimmer-bar bg-surface-container-high h-7 w-14 rounded-xl" />
            <div className="space-y-1">
              <div className="shimmer-bar bg-surface-container-high h-3 w-20 rounded-full" />
              <div className="shimmer-bar bg-surface-container-high h-2.5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 space-y-4">
            <div className="shimmer-bar bg-surface-container-high h-5 w-44 rounded-xl" />
            <div className="shimmer-bar bg-surface-container-high h-44 w-full rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Weak words table */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 space-y-4">
        <div className="shimmer-bar bg-surface-container-high h-5 w-36 rounded-xl" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-t border-surface-container-high">
            <div className="shimmer-bar bg-surface-container-high flex-1 h-3.5 rounded-full" />
            <div className="shimmer-bar bg-surface-container-high h-3.5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
