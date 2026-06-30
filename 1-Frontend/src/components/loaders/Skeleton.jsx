export const SkeletonLine = ({ className = '' }) => (
  <div className={`skeleton rounded-md h-4 ${className}`} />
)

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700 space-y-3">
    <SkeletonLine className="w-1/2" />
    <SkeletonLine className="w-1/3 h-7" />
    <SkeletonLine className="w-2/3" />
  </div>
)

export const SkeletonTable = ({ rows = 6, cols = 5 }) => (
  <div className="bg-white dark:bg-ink-800 rounded-2xl p-5 shadow-card border border-ink-50 dark:border-ink-700">
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
)
