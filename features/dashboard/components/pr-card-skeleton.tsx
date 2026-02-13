export function PRCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card p-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>

      {/* Meta row */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>

      {/* Labels + Status */}
      <div className="mt-3.5 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>

      {/* Bottom row */}
      <div className="mt-3.5 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-full bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="flex -space-x-1.5">
            <div className="size-5 rounded-full bg-muted" />
            <div className="size-5 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
