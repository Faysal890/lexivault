export default function Loading() {
  return (
    <div className="py-4 space-y-4 animate-pulse">
      <div className="h-8 bg-surface-container-high rounded-2xl w-48" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-surface-container-high rounded-2xl" />
        ))}
      </div>
      <div className="h-40 bg-surface-container-high rounded-3xl" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-surface-container-high rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
