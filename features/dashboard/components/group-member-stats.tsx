"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { AlertCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeamMember } from "@/types/team-config";
import { dashboardQueries } from "../queries";
import {
  STATS_RANGES,
  type MemberStats,
  type StatsRange,
} from "../types/member-stats";
import { UserAvatar } from "./user-avatar";

const RANGE_LABELS: Record<StatsRange, string> = {
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
  all: "All time",
};

const RANGE_DAYS: Record<Exclude<StatsRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

type StatColumn = {
  key: Exclude<keyof MemberStats, "login">;
  label: string;
  /** Builds the GitHub search that backs this count */
  search: (login: string, org: string, since: string | null) => string;
};

const COLUMNS: StatColumn[] = [
  {
    key: "open",
    label: "Open",
    search: (l, o, s) =>
      `is:pr org:${o} author:${l} is:open${s ? ` created:>=${s}` : ""}`,
  },
  {
    key: "merged",
    label: "Merged",
    search: (l, o, s) =>
      `is:pr org:${o} author:${l} is:merged${s ? ` merged:>=${s}` : ""}`,
  },
  {
    key: "closed",
    label: "Closed",
    search: (l, o, s) =>
      `is:pr org:${o} author:${l} is:closed is:unmerged${s ? ` closed:>=${s}` : ""}`,
  },
  {
    key: "reviewed",
    label: "Reviewed",
    search: (l, o, s) =>
      `is:pr org:${o} reviewed-by:${l} -author:${l}${s ? ` updated:>=${s}` : ""}`,
  },
];

function sinceDate(range: StatsRange): string | null {
  if (range === "all") return null;
  const date = new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function searchUrl(query: string): string {
  return `https://github.com/search?type=pullrequests&q=${encodeURIComponent(query)}`;
}

function mergeRate(stats: MemberStats): number | null {
  const finished = stats.merged + stats.closed;
  return finished === 0 ? null : stats.merged / finished;
}

type GroupMemberStatsProps = {
  org: string;
  logins: string[];
  /** Always shown first; counted in totals only when in `logins` */
  viewerLogin: string;
  membersByLogin: Map<string, TeamMember>;
};

export function GroupMemberStats({
  org,
  logins,
  viewerLogin,
  membersByLogin,
}: GroupMemberStatsProps) {
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(STATS_RANGES).withDefault("90d"),
  );
  const viewerInGroup = logins.includes(viewerLogin);
  const rowLogins = [viewerLogin, ...logins.filter((l) => l !== viewerLogin)];
  const query = useQuery(dashboardQueries.memberStats(org, rowLogins, range));
  const since = sinceDate(range);

  const statsByLogin = new Map(query.data?.map((s) => [s.login, s]));
  const groupStats = query.data?.filter((s) => logins.includes(s.login));
  const totals = groupStats?.reduce(
    (acc, s) => ({
      login: "",
      open: acc.open + s.open,
      merged: acc.merged + s.merged,
      closed: acc.closed + s.closed,
      reviewed: acc.reviewed + s.reviewed,
    }),
    { login: "", open: 0, merged: 0, closed: 0, reviewed: 0 },
  );
  const maxFinished = Math.max(
    1,
    ...(query.data?.map((s) => s.merged + s.closed) ?? []),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member activity</CardTitle>
        <CardDescription>
          Pull requests in {org}
          {since ? ` since ${since}` : ""}. Click a number to see the PRs on
          GitHub.
        </CardDescription>
        <CardAction>
          <div
            role="radiogroup"
            aria-label="Time range"
            className="flex rounded-md border p-0.5"
          >
            {STATS_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                  range === r && "bg-accent font-medium text-foreground",
                )}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        {query.isError ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircleIcon className="size-4" />
            Couldn&apos;t load stats from GitHub.
            <button
              type="button"
              className="ml-auto underline underline-offset-2"
              onClick={() => query.refetch()}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-3 text-left font-medium">Member</th>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="px-3 py-2 text-right font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="py-2 pl-3 text-left font-medium">
                    Merge rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowLogins.map((login) => {
                  const member = membersByLogin.get(login);
                  const stats = statsByLogin.get(login);
                  const isViewer = login === viewerLogin;
                  return (
                    <tr
                      key={login}
                      className={cn(
                        "border-b last:border-0",
                        isViewer && "bg-accent/40",
                        isViewer && !viewerInGroup && "border-dashed",
                      )}
                    >
                      <td className="py-2 pr-3">
                        <a
                          href={`https://github.com/${login}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 hover:underline"
                        >
                          {member ? (
                            <Image
                              width={24}
                              height={24}
                              src={member.avatar_url}
                              alt=""
                              className="size-6 rounded-full"
                            />
                          ) : (
                            <UserAvatar username={login} className="size-6" />
                          )}
                          <span className="truncate">{login}</span>
                          {isViewer && (
                            <span className="text-xs text-muted-foreground">
                              {viewerInGroup ? "(you)" : "(you, not in group)"}
                            </span>
                          )}
                        </a>
                      </td>
                      {COLUMNS.map((c) => (
                        <td
                          key={c.key}
                          className="px-3 py-2 text-right tabular-nums"
                        >
                          {stats ? (
                            <a
                              href={searchUrl(c.search(login, org, since))}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                "hover:underline",
                                stats[c.key] === 0 && "text-muted-foreground",
                              )}
                            >
                              {stats[c.key]}
                            </a>
                          ) : (
                            <span className="ml-auto inline-block h-4 w-6 animate-pulse rounded bg-muted" />
                          )}
                        </td>
                      ))}
                      <td className="py-2 pl-3">
                        {stats ? (
                          <MergeRateBar stats={stats} max={maxFinished} />
                        ) : (
                          <span className="inline-block h-2 w-24 animate-pulse rounded bg-muted" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {totals && logins.length > 1 && (
                <tfoot>
                  <tr className="border-t font-medium">
                    <td className="py-2 pr-3 text-muted-foreground">Total</td>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.key}
                        className="px-3 py-2 text-right tabular-nums"
                      >
                        {totals[c.key]}
                      </td>
                    ))}
                    <td className="py-2 pl-3 text-muted-foreground tabular-nums">
                      {formatRate(mergeRate(totals))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRate(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

/** Bar length = finished PRs relative to the busiest member; fill split merged/closed */
function MergeRateBar({ stats, max }: { stats: MemberStats; max: number }) {
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
            className="h-full bg-emerald-500"
            style={{ width: `${(rate ?? 0) * 100}%` }}
          />
          <div className="h-full flex-1 bg-rose-400" />
        </div>
      </div>
      <span className="w-9 text-xs text-muted-foreground tabular-nums">
        {formatRate(rate)}
      </span>
    </div>
  );
}
