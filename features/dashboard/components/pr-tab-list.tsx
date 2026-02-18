"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString, parseAsStringLiteral } from "nuqs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDownIcon, XIcon } from "lucide-react";
import { PRCard } from "./pr-card";
import { PRCardSkeleton } from "./pr-card-skeleton";
import { PREmptyState } from "./pr-empty-state";
import { MemberPicker } from "./member-picker";
import { GroupPicker } from "./group-picker";
import { UserAvatar } from "./user-avatar";
import { dashboardQueries } from "../queries";
import { useSelectedMembers } from "../hooks/use-selected-members";
import type {
  DashboardTab,
  PullRequest,
  ReviewStatus,
  SortOption,
} from "../types/dashboard";
import { useRelativeTime } from "../hooks/use-relative-time";

function isOpenForReview(pr: PullRequest): boolean {
  return !pr.isDraft;
}

const TABS: { id: DashboardTab; label: string; tooltip?: string }[] = [
  {
    id: "assigned",
    label: "Assigned to Me",
    tooltip:
      "Shows open PRs where your review has been requested, either directly or through a team (e.g. CODEOWNERS).",
  },
  {
    id: "team-prs",
    label: "My Team's PRs",
    tooltip:
      "Shows open PRs authored by your selected team members. Your own PRs are excluded.",
  },
];

const EMPTY_MESSAGES: Record<DashboardTab, string> = {
  assigned: "No reviews assigned to you",
  "team-prs": "No open PRs from your team",
};

const READY_EMPTY_MESSAGES: Record<DashboardTab, string> = {
  assigned: "No open assigned PRs",
  "team-prs": "No open team PRs",
};

export function PRTabList() {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(["assigned", "team-prs"] as const).withDefault("assigned"),
  );
  const [prFilter, setPrFilter] = useQueryState(
    "filter",
    parseAsStringLiteral(["all", "open"] as const).withDefault("all"),
  );
  const [authorFilter, setAuthorFilter] = useQueryState(
    "author",
    parseAsString.withDefault(""),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(["updated", "status", "author"] as const).withDefault(
      "updated",
    ),
  );
  const selectedMembers = useSelectedMembers();

  const viewerQuery = useQuery(dashboardQueries.viewer());
  const assignedQuery = useQuery(dashboardQueries.assigned());
  const teamPrsQuery = useQuery(dashboardQueries.teamPrs(selectedMembers));

  function getTabData(tabId: DashboardTab): PullRequest[] {
    switch (tabId) {
      case "assigned":
        return assignedQuery.data ?? [];
      case "team-prs":
        return teamPrsQuery.data ?? [];
    }
  }

  function applyFilter(prs: PullRequest[]): PullRequest[] {
    let filtered = prs;
    if (prFilter === "open") filtered = filtered.filter(isOpenForReview);
    if (authorFilter) filtered = filtered.filter((pr) => pr.author === authorFilter);
    return applySort(filtered);
  }

  function applySort(prs: PullRequest[]): PullRequest[] {
    if (sort === "updated") {
      return [...prs].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    if (sort === "author") {
      return [...prs].sort((a, b) =>
        a.author.localeCompare(b.author, undefined, { sensitivity: "base" }),
      );
    }
    // sort === "status": most actionable first
    const STATUS_PRIORITY: Record<ReviewStatus, number> = {
      changes_requested: 0,
      pending: 1,
      commented: 2,
      approved: 3,
    };
    return [...prs].sort((a, b) => {
      const aScore = a.isDraft ? 4 : STATUS_PRIORITY[a.reviewStatus];
      const bScore = b.isDraft ? 4 : STATUS_PRIORITY[b.reviewStatus];
      return aScore - bScore;
    });
  }

  function getTabCount(tabId: DashboardTab): number | undefined {
    switch (tabId) {
      case "assigned":
        if (assignedQuery.isLoading) return undefined;
        return applyFilter(assignedQuery.data ?? []).length;
      case "team-prs":
        if (teamPrsQuery.isLoading) return undefined;
        return applyFilter(teamPrsQuery.data ?? []).length;
    }
  }

  const isLoading =
    (activeTab === "assigned" && assignedQuery.isLoading) ||
    (activeTab === "team-prs" && teamPrsQuery.isLoading);

  const currentData = applyFilter(getTabData(activeTab));

  const activeTimestamp =
    activeTab === "assigned"
      ? assignedQuery.dataUpdatedAt
      : teamPrsQuery.dataUpdatedAt;
  const lastUpdatedAt = useRelativeTime(activeTimestamp);

  const showEmptyPrompt =
    activeTab === "team-prs" && selectedMembers.length === 0;

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => {
          const count = getTabCount(tab.id);
          const countBadge = (
            <span
              className={cn(
                "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/10 text-foreground/60",
              )}
            >
              {count ?? "–"}
            </span>
          );

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {tab.label}
              {tab.tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>{countBadge}</TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    {tab.tooltip}
                  </TooltipContent>
                </Tooltip>
              ) : (
                countBadge
              )}
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
            <Button
              variant={prFilter === "all" ? "default" : "ghost"}
              size="xs"
              onClick={() => setPrFilter("all")}
            >
              All
            </Button>
            <Button
              variant={prFilter === "open" ? "default" : "ghost"}
              size="xs"
              onClick={() => setPrFilter("open")}
            >
              Open
            </Button>
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger size="sm">
              <ArrowUpDownIcon className="size-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="author">Author</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            Last updated:{" "}
            <span className="font-mono">{lastUpdatedAt}</span>
          </span>
        </div>
      </div>

      {activeTab === "team-prs" && (
        <div className="mt-4 space-y-3">
          <GroupPicker />
          <MemberPicker />
        </div>
      )}

      {authorFilter && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by</span>
          <button
            type="button"
            onClick={() => setAuthorFilter("")}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 py-0.5 pl-1 pr-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            <UserAvatar username={authorFilter} className="size-4" />
            {authorFilter}
            <XIcon className="size-3 text-muted-foreground" />
          </button>
        </div>
      )}

      <div key={activeTab} className="mt-6 space-y-3 pb-12">
        {showEmptyPrompt ? (
          <PREmptyState message="Select team members above to see their open PRs" />
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <PRCardSkeleton />
            </div>
          ))
        ) : currentData.length === 0 ? (
          <PREmptyState
            message={
              prFilter === "open"
                ? READY_EMPTY_MESSAGES[activeTab]
                : EMPTY_MESSAGES[activeTab]
            }
          />
        ) : (
          currentData.map((pr, i) => (
            <div
              key={pr.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <PRCard pr={pr} onAuthorClick={setAuthorFilter} viewerLogin={viewerQuery.data?.login} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
