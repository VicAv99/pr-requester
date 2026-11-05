"use client";

import type { PropsWithChildren } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react";
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
import {
  buildStatSearch,
  statsSinceDate,
  type StatKey,
} from "../utils/member-stats-search";
import { RepoFilter } from "./repo-filter";
import { UserAvatar } from "./user-avatar";

const RANGE_LABELS: Record<StatsRange, string> = {
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
  all: "All time",
};

const COLUMNS: { key: StatKey; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "merged", label: "Merged" },
  { key: "closed", label: "Closed" },
  { key: "reviewed", label: "Reviewed" },
];

const SORT_KEYS = ["member", "open", "merged", "closed", "reviewed", "rate"] as const;
type SortKey = (typeof SORT_KEYS)[number];
const SORT_DIRS = ["asc", "desc"] as const;
type SortDir = (typeof SORT_DIRS)[number];

/** Names read naturally A→Z; numbers are most useful highest-first */
function firstDir(key: SortKey): SortDir {
  return key === "member" ? "asc" : "desc";
}

function sortValue(key: SortKey, login: string, stats: MemberStats): number | string | null {
  if (key === "member") return login.toLowerCase();
  if (key === "rate") return mergeRate(stats);
  return stats[key];
}

function sortLogins(
  logins: string[],
  statsByLogin: Map<string, MemberStats>,
  key: SortKey,
  dir: SortDir,
): string[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...logins].sort((a, b) => {
    const sa = statsByLogin.get(a);
    const sb = statsByLogin.get(b);
    // Rows still loading keep their place
    if (!sa || !sb) return 0;
    const va = sortValue(key, a, sa);
    const vb = sortValue(key, b, sb);
    // No merge rate (nothing finished) always sorts last
    if (va === null || vb === null) return va === vb ? 0 : va === null ? 1 : -1;
    if (typeof va === "string" && typeof vb === "string") {
      return sign * va.localeCompare(vb);
    }
    return sign * ((va as number) - (vb as number));
  });
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
  const [repos, setRepos] = useQueryState(
    "repos",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [sortKey, setSortKey] = useQueryState(
    "sort",
    parseAsStringLiteral(SORT_KEYS),
  );
  const [sortDir, setSortDir] = useQueryState(
    "dir",
    parseAsStringLiteral(SORT_DIRS),
  );
  const viewerInGroup = logins.includes(viewerLogin);
  const rowLogins = [viewerLogin, ...logins.filter((l) => l !== viewerLogin)];
  const query = useQuery(dashboardQueries.memberStats(org, rowLogins, range, repos));
  const since = statsSinceDate(range);

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
  // You sort alongside the group so you can see where you rank
  const sortedLogins = sortKey
    ? sortLogins(rowLogins, statsByLogin, sortKey, sortDir ?? firstDir(sortKey))
    : rowLogins;

  function cycleSort(key: SortKey) {
    const dir = sortDir ?? (sortKey ? firstDir(sortKey) : null);
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir(firstDir(key));
    } else if (dir === firstDir(key)) {
      setSortDir(firstDir(key) === "asc" ? "desc" : "asc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  function headerProps(key: SortKey) {
    return {
      active: sortKey === key,
      dir: sortKey === key ? (sortDir ?? firstDir(key)) : null,
      onClick: () => cycleSort(key),
    };
  }

  const maxFinished = Math.max(
    1,
    ...(query.data?.map((s) => s.merged + s.closed) ?? []),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member activity</CardTitle>
        <CardDescription>
          Pull requests in{" "}
          {repos.length === 0
            ? org
            : `${repos.length} repo${repos.length !== 1 ? "s" : ""}`}
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
                  range === r && "bg-muted font-medium text-foreground",
                )}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <RepoFilter
          org={org}
          value={repos}
          onChange={(next) => setRepos(next.length > 0 ? next : null)}
        />
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
                  <SortHeader
                    {...headerProps("member")}
                    className="pr-3 text-left"
                  >
                    Member
                  </SortHeader>
                  {COLUMNS.map((c) => (
                    <SortHeader
                      key={c.key}
                      {...headerProps(c.key)}
                      align="right"
                      className="px-3"
                    >
                      {c.label}
                    </SortHeader>
                  ))}
                  <SortHeader
                    {...headerProps("rate")}
                    className="pl-3 text-left"
                  >
                    Merge rate
                  </SortHeader>
                </tr>
              </thead>
              <tbody>
                {sortedLogins.map((login) => {
                  const member = membersByLogin.get(login);
                  const stats = statsByLogin.get(login);
                  const isViewer = login === viewerLogin;
                  return (
                    <tr
                      key={login}
                      className={cn(
                        "border-b last:border-0",
                        isViewer && "bg-muted/60",
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
                              href={searchUrl(
                                buildStatSearch({
                                  key: c.key,
                                  login,
                                  org,
                                  repos,
                                  since,
                                }),
                              )}
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

function SortHeader({
  active,
  dir,
  onClick,
  align = "left",
  className,
  children,
}: PropsWithChildren<{
  active: boolean;
  dir: SortDir | null;
  onClick: () => void;
  align?: "left" | "right";
  className?: string;
}>) {
  const Icon = !active ? ArrowUpDownIcon : dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <th
      aria-sort={!active ? "none" : dir === "asc" ? "ascending" : "descending"}
      className={cn("py-2 font-medium", align === "right" && "text-right", className)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active && "text-foreground",
        )}
      >
        {children}
        <Icon className="size-3" />
      </button>
    </th>
  );
}
