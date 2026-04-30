export default function Loading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      <div className="space-y-2">
        <div className="shimmer-bar bg-surface-container-high h-3 w-20 rounded-full" />
        <div className="shimmer-bar bg-surface-container-high h-9 w-56 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer-bar bg-surface-container-high aspect-square lg:h-36 lg:aspect-auto rounded-2xl" />
        ))}
      </div>
      <div className="shimmer-bar bg-surface-container-high h-40 w-full rounded-3xl" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer-bar bg-surface-container-high h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
