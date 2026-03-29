export function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 flex flex-col gap-2">
        <div className="skeleton h-3 w-2/5 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-3/5 rounded" />
        <div className="skeleton h-5 w-2/5 rounded mt-2" />
      </div>
    </div>
  );
}
