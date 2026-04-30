export default function ProfileLoading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      {/* Page title */}
      <div className="shimmer-bar bg-surface-container-high h-9 w-32 rounded-2xl" />

      {/* Avatar card + streak stats */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-6 lg:space-y-0">
        <div className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 flex items-center gap-4 lg:col-span-3">
          <div className="shimmer-bar bg-surface-container-high w-16 h-16 lg:w-20 lg:h-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer-bar bg-surface-container-high h-6 w-40 rounded-xl" />
            <div className="shimmer-bar bg-surface-container-high h-3.5 w-48 rounded-full" />
            <div className="shimmer-bar bg-surface-container-high h-3 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:col-span-2 lg:grid-cols-1 lg:gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="shimmer-bar bg-surface-container-high h-20 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Profile form card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 lg:p-8 space-y-5">
        <div className="shimmer-bar bg-surface-container-high h-6 w-36 rounded-xl" />
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="shimmer-bar bg-surface-container-high h-3.5 w-24 rounded-full" />
              <div className="shimmer-bar bg-surface-container-high h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Security section */}
      <div className="shimmer-bar bg-surface-container-high h-16 w-full rounded-3xl" />
    </div>
  );
}
