export default function QuizLoading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="shimmer-bar bg-surface-container-high h-3 w-32 rounded-full" />
        <div className="shimmer-bar bg-surface-container-high h-9 w-44 rounded-2xl" />
      </div>

      {/* Quiz type + size cards */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-6 lg:space-y-0">
        <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 space-y-4 lg:col-span-3">
          <div className="shimmer-bar bg-surface-container-high h-3.5 w-20 rounded-full" />
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer-bar bg-surface-container-high h-16 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 space-y-3 lg:col-span-2">
          <div className="shimmer-bar bg-surface-container-high h-3.5 w-36 rounded-full" />
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-2 lg:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shimmer-bar bg-surface-container-high h-12 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="shimmer-bar bg-surface-container-high h-14 w-full rounded-2xl lg:max-w-md lg:mx-auto" />
    </div>
  );
}
