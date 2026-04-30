export default function EditWordLoading() {
  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8 lg:max-w-4xl lg:mx-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <div className="shimmer-bar bg-surface-container-high w-9 h-9 rounded-xl" />
        <div className="shimmer-bar bg-surface-container-high h-8 w-32 rounded-2xl" />
      </div>

      {/* Main fields card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-7 space-y-4">
        <div className="space-y-1.5">
          <div className="shimmer-bar bg-surface-container-high h-3.5 w-28 rounded-full" />
          <div className="shimmer-bar bg-surface-container-high h-11 w-full rounded-xl" />
        </div>
        <div className="lg:grid lg:grid-cols-2 lg:gap-5 space-y-4 lg:space-y-0">
          <div className="space-y-1.5">
            <div className="shimmer-bar bg-surface-container-high h-3.5 w-20 rounded-full" />
            <div className="shimmer-bar bg-surface-container-high h-24 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="shimmer-bar bg-surface-container-high h-3.5 w-36 rounded-full" />
            <div className="shimmer-bar bg-surface-container-high h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Difficulty + Tags */}
      <div className="lg:grid lg:grid-cols-5 lg:gap-5 space-y-4 lg:space-y-0">
        <div className="shimmer-bar bg-surface-container-high h-28 rounded-3xl lg:col-span-2" />
        <div className="shimmer-bar bg-surface-container-high h-28 rounded-3xl lg:col-span-3" />
      </div>

      {/* Save button */}
      <div className="shimmer-bar bg-surface-container-high h-14 w-full rounded-2xl lg:max-w-md lg:mx-auto" />
    </div>
  );
}
