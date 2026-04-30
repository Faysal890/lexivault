export default function DashboardLoading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      {/* Header */}
      <div className="py-2 lg:py-0 space-y-2">
        <div className="shimmer-bar bg-surface-container-high h-3 w-24 rounded-full" />
        <div className="shimmer-bar bg-surface-container-high h-9 w-64 rounded-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-5 lg:p-6 rounded-2xl aspect-square lg:aspect-auto lg:h-36 flex flex-col justify-between">
            <div className="shimmer-bar bg-surface-container-high w-10 h-10 lg:w-12 lg:h-12 rounded-xl" />
            <div className="space-y-1.5">
              <div className="shimmer-bar bg-surface-container-high h-8 w-14 rounded-xl" />
              <div className="shimmer-bar bg-surface-container-high h-3 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning + Recent Words */}
      <div className="space-y-6 lg:grid lg:grid-cols-5 lg:gap-6 lg:space-y-0">
        {/* Continue Learning */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="shimmer-bar bg-surface-container-high h-6 w-48 rounded-xl" />
            <div className="shimmer-bar bg-surface-container-high h-3.5 w-full rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="shimmer-bar bg-surface-container-high h-3 w-28 rounded-full" />
              <div className="shimmer-bar bg-surface-container-high h-3 w-8 rounded-full" />
            </div>
            <div className="shimmer-bar bg-surface-container-high h-2.5 w-full rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="shimmer-bar bg-surface-container-high flex-1 h-11 rounded-2xl" />
            <div className="shimmer-bar bg-surface-container-high flex-1 h-11 rounded-2xl" />
          </div>
        </div>

        {/* Recent Words */}
        <div className="space-y-3 lg:col-span-3 lg:bg-surface-container-lowest lg:rounded-3xl lg:p-6 lg:space-y-4">
          <div className="flex items-center justify-between px-1 lg:px-0">
            <div className="shimmer-bar bg-surface-container-high h-6 w-32 rounded-xl" />
            <div className="shimmer-bar bg-surface-container-high h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="shimmer-bar bg-surface-container-high w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="shimmer-bar bg-surface-container-high h-3.5 w-24 rounded-full" />
                  <div className="shimmer-bar bg-surface-container-high h-3 w-40 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
