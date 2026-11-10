"use client";

import type { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardQueries } from "../queries";
import type { MemberRepos, StatsRange } from "../types/member-stats";
import {
  STAT_KEYS,
  buildStatSearch,
  githubSearchUrl,
} from "../utils/member-stats-search";
import { MergeRateBar } from "./merge-rate-bar";

/** Repos broken out when no repo filter is active */
const TOP_REPOS = 10;
const COL_COUNT = STAT_KEYS.length + 2;

type MemberRepoRowsProps = {
  org: string;
  login: string;
  range: StatsRange;
  since: string | null;
  /** Repos in the activity filter; when set, these are the rows shown */
  filterRepos: string[];
  memberRepos: MemberRepos | undefined;
  memberReposLoading: boolean;
  memberReposError: boolean;
  /** Shared bar scale so repo bars compare against member bars */
  maxFinished: number;
  onToggleFilter: (repo: string) => void;
};

/** Per-repo sub-rows rendered under an expanded member row */
export function MemberRepoRows({
  org,
  login,
  range,
  since,
  filterRepos,
  memberRepos,
  memberReposLoading,
  memberReposError,
  maxFinished,
  onToggleFilter,
}: MemberRepoRowsProps) {
  const filtered = filterRepos.length > 0;
  const candidates = filtered
    ? filterRepos
    : (memberRepos?.repos.slice(0, TOP_REPOS).map((r) => r.name) ?? []);
  const query = useQuery(
    dashboardQueries.memberRepoStats(org, login, range, candidates),
  );

  if ((!filtered && memberReposError) || query.isError) {
    return (
      <NoteRow>
        Couldn&apos;t load repo breakdown from GitHub.{" "}
        {query.isError && (
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => query.refetch()}
          >
            Retry
          </button>
        )}
      </NoteRow>
    );
  }

  const loading = (!filtered && memberReposLoading) || query.isLoading;
  if (loading) {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <tr key={i} className="border-b bg-muted/20">
            <td colSpan={COL_COUNT} className="py-2 pl-10 pr-3">
              <span className="block h-4 w-full animate-pulse rounded bg-muted" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  const rows = (query.data ?? [])
    .filter((r) => filtered || STAT_KEYS.some((k) => r[k] > 0))
    .sort(
      (a, b) =>
        STAT_KEYS.reduce((sum, k) => sum + b[k] - a[k], 0) ||
        a.repo.localeCompare(b.repo),
    );

  if (rows.length === 0) {
    return <NoteRow>No PRs authored or reviewed in this range.</NoteRow>;
  }

  const moreRepos =
    !filtered &&
    ((memberRepos?.repos.length ?? 0) > TOP_REPOS || memberRepos?.truncated);

  return (
    <>
      {rows.map((row) => {
        const isFiltered = filterRepos.includes(row.repo);
        return (
          <tr key={row.repo} className="border-b bg-muted/20 text-xs">
            <td className="py-1.5 pl-10 pr-3">
              <button
                type="button"
                onClick={() => onToggleFilter(row.repo)}
                aria-pressed={isFiltered}
                title={`${isFiltered ? "Remove" : "Filter"} activity by ${row.repo}`}
                className="group/repo inline-flex max-w-full items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <span className="truncate">{row.repo}</span>
                <FilterIcon
                  className={cn(
                    "size-3 shrink-0 opacity-0 group-hover/repo:opacity-100",
                    isFiltered && "text-primary opacity-100",
                  )}
                />
              </button>
            </td>
            {STAT_KEYS.map((key) => (
              <td key={key} className="px-3 py-1.5 text-right tabular-nums">
                <a
                  href={githubSearchUrl(
                    buildStatSearch({
                      key,
                      login,
                      org,
                      repos: [row.repo],
                      since,
                    }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "hover:underline",
                    row[key] === 0 && "text-muted-foreground",
                  )}
                >
                  {row[key]}
                </a>
              </td>
            ))}
            <td className="py-1.5 pl-3">
              <MergeRateBar stats={row} max={maxFinished} />
            </td>
          </tr>
        );
      })}
      {moreRepos && (
        <NoteRow>
          Top {TOP_REPOS} repos by their recent activity. Filter by repo to see
          others.
        </NoteRow>
      )}
    </>
  );
}

function NoteRow({ children }: PropsWithChildren) {
  return (
    <tr className="border-b bg-muted/20">
      <td
        colSpan={COL_COUNT}
        className="py-1.5 pl-10 pr-3 text-xs text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  );
}
