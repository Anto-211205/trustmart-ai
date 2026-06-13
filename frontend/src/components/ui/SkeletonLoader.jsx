export function SkeletonCard() {
  return (
    <div className="glass rounded-[var(--radius-lg)] p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
        <div className="skeleton h-16 w-16 rounded-full ml-4" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-2 w-full rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonDetailHero() {
  return (
    <div className="glass rounded-[var(--radius-xl)] p-8 space-y-4">
      <div className="skeleton h-8 w-1/3" />
      <div className="skeleton h-4 w-1/4" />
      <div className="flex gap-4 mt-4">
        <div className="skeleton h-12 w-24 rounded-[var(--radius-md)]" />
        <div className="skeleton h-12 w-24 rounded-[var(--radius-md)]" />
        <div className="skeleton h-12 w-24 rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-[var(--radius-lg)] p-5 space-y-3">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
