export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-xl border border-slate-200 bg-white"
        >
          <div className="flex h-full items-center gap-4 px-4">
            <div className="h-10 w-10 rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
