import type { MemberStats } from "../types/member-stats";

type FinishedCounts = Pick<MemberStats, "merged" | "closed">;

export function mergeRate(stats: FinishedCounts): number | null {
  const finished = stats.merged + stats.closed;
  return finished === 0 ? null : stats.merged / finished;
}

export function formatRate(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

/** Bar length = finished PRs relative to the busiest member; fill split merged/closed */
export function MergeRateBar({ stats, max }: { stats: FinishedCounts; max: number }) {
  const finished = stats.merged + stats.closed;
  const rate = mergeRate(stats);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className="flex h-full"
          style={{ width: `${(finished / max) * 100}%` }}
        >
          <div
            className="h-full bg-status-approved"
            style={{ width: `${(rate ?? 0) * 100}%` }}
          />
          <div className="h-full flex-1 bg-status-changes-requested" />
        </div>
      </div>
      <span className="w-9 text-xs text-muted-foreground tabular-nums">
        {formatRate(rate)}
      </span>
    </div>
  );
}
