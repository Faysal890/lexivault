export default function StoreLoading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="shimmer-bar bg-surface-container-high h-3 w-16 rounded-full" />
        <div className="shimmer-bar bg-surface-container-high h-9 w-40 rounded-2xl" />
      </div>

      {/* Balance card */}
      <div className="shimmer-bar bg-surface-container-high h-24 w-full rounded-3xl" />

      {/* Coin packages */}
      <div className="space-y-3">
        <div className="shimmer-bar bg-surface-container-high h-5 w-36 rounded-xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl p-5 space-y-4">
              <div className="shimmer-bar bg-surface-container-high h-6 w-24 rounded-xl" />
              <div className="shimmer-bar bg-surface-container-high h-8 w-16 rounded-xl" />
              <div className="shimmer-bar bg-surface-container-high h-10 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div className="space-y-3">
        <div className="shimmer-bar bg-surface-container-high h-5 w-44 rounded-xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-3">
            <div className="shimmer-bar bg-surface-container-high w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="shimmer-bar bg-surface-container-high h-3.5 w-32 rounded-full" />
              <div className="shimmer-bar bg-surface-container-high h-3 w-24 rounded-full" />
            </div>
            <div className="shimmer-bar bg-surface-container-high h-5 w-16 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
