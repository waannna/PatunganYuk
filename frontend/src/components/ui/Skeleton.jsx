// src/components/ui/Skeleton.jsx
export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12',
    card: 'h-32 w-full',
    button: 'h-10 w-24',
    circle: 'h-10 w-10 rounded-full',
  };
  return (
    <div className={`
      animate-pulse bg-stone-200 border border-dashed border-stone-300
      ${variants[variant]} ${className}
    `} />
  );
}

export function SkeletonCard() {
  return (
    <div className="receipt-paper receipt-shadow border border-stone-300/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-10 w-3/4 mb-3" />
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dashed border-stone-300">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function SkeletonTransaction() {
  return (
    <div className="px-5 py-3 flex items-center gap-3 border-b border-dashed border-stone-200">
      <div className="w-10 h-10 bg-stone-200 animate-pulse border border-dashed border-stone-300" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-2 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="receipt-paper receipt-shadow border border-stone-300/60 p-5">
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="flex items-end justify-between gap-2 h-32">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-stone-200 animate-pulse border border-dashed border-stone-300"
              style={{ height: `${(i * 13) % 60 + 30}%` }}
            />
            <Skeleton className="h-2 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}