"use client";

import { FilterIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberRepos } from "../types/member-stats";

type MemberRepoListProps = {
  data: MemberRepos | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Repos currently in the activity filter */
  selected: string[];
  onToggle: (repo: string) => void;
};

/** Per-repo breakdown shown in the member hover card */
export function MemberRepoList({
  data,
  isLoading,
  isError,
  selected,
  onToggle,
}: MemberRepoListProps) {
  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn&apos;t load repos from GitHub.
      </p>
    );
  }
  if (isLoading || !data) {
    return (
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }
  if (data.repos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No PRs authored or reviewed in this range.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1.5 text-xs text-muted-foreground">
        <span>Repo</span>
        <span className="text-right">Authored</span>
        <span className="text-right">Reviewed</span>
      </div>
      <ul className="max-h-64 space-y-0.5 overflow-y-auto">
        {data.repos.map((repo) => {
          const isSelected = selected.includes(repo.name);
          return (
            <li key={repo.name}>
              <button
                type="button"
                onClick={() => onToggle(repo.name)}
                aria-pressed={isSelected}
                title={`${isSelected ? "Remove" : "Filter"} activity by ${repo.name}`}
                className={cn(
                  "group/repo grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-md px-1.5 py-1 text-left text-sm transition-colors hover:bg-muted",
                  isSelected && "bg-primary/10 hover:bg-primary/15",
                )}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{repo.name}</span>
                  <FilterIcon
                    className={cn(
                      "size-3 shrink-0 text-muted-foreground opacity-0 group-hover/repo:opacity-100",
                      isSelected && "text-primary opacity-100",
                    )}
                  />
                </span>
                <span className="text-right tabular-nums">{repo.authored}</span>
                <span className="text-right tabular-nums">{repo.reviewed}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Click a repo to filter.
        {data.truncated &&
          " Based on their latest 100 authored and 100 reviewed PRs."}
      </p>
    </div>
  );
}
