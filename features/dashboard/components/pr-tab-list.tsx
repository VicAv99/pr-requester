"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRCard } from "./pr-card";
import { PRCardSkeleton } from "./pr-card-skeleton";
import { PREmptyState } from "./pr-empty-state";
import { MemberPicker } from "./member-picker";
import { dashboardQueries } from "../queries";
import { useSelectedMembers } from "../hooks/use-selected-members";
import { NEEDS_TEAM_REVIEW } from "../constants/mock-data";
import type { DashboardTab, PullRequest } from "../types/dashboard";
import { getRelativeTime } from "../utils/relative-time";

function isReadyToMerge(pr: PullRequest): boolean {
  return pr.reviewStatus === "approved" && !pr.isDraft;
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
  { id: "needs-review", label: "Needs Team Review" },
];

const EMPTY_MESSAGES: Record<DashboardTab, string> = {
  assigned: "No reviews assigned to you",
  "team-prs": "No open PRs from your team",
  "needs-review": "No PRs need your team's review",
};

const READY_EMPTY_MESSAGES: Record<DashboardTab, string> = {
  assigned: "No assigned PRs are ready to merge",
  "team-prs": "No team PRs are ready to merge",
  "needs-review": "No PRs needing review are ready to merge",
};

type PrFilter = "all" | "ready";

export function PRTabList() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("assigned");
  const [prFilter, setPrFilter] = useState<PrFilter>("all");
  const selectedMembers = useSelectedMembers();

  const assignedQuery = useQuery(dashboardQueries.assigned());
  const teamPrsQuery = useQuery(dashboardQueries.teamPrs(selectedMembers));

  function getTabData(tabId: DashboardTab): PullRequest[] {
    switch (tabId) {
      case "assigned":
        return assignedQuery.data ?? [];
      case "team-prs":
        return teamPrsQuery.data ?? [];
      case "needs-review":
        return NEEDS_TEAM_REVIEW;
    }
  }

  function applyFilter(prs: PullRequest[]): PullRequest[] {
    if (prFilter === "ready") return prs.filter(isReadyToMerge);
    return prs;
  }

  function getTabCount(tabId: DashboardTab): number | undefined {
    switch (tabId) {
      case "assigned":
        if (assignedQuery.isLoading) return undefined;
        return applyFilter(assignedQuery.data ?? []).length;
      case "team-prs":
        if (teamPrsQuery.isLoading) return undefined;
        return applyFilter(teamPrsQuery.data ?? []).length;
      default:
        return applyFilter(getTabData(tabId)).length;
    }
  }

  const isLoading =
    (activeTab === "assigned" && assignedQuery.isLoading) ||
    (activeTab === "team-prs" && teamPrsQuery.isLoading);

  const currentData = applyFilter(getTabData(activeTab));

  const lastUpdatedAt = (() => {
    if (activeTab === "assigned" && assignedQuery.dataUpdatedAt) {
      return getRelativeTime(
        new Date(assignedQuery.dataUpdatedAt).toISOString(),
      );
    }
    if (activeTab === "team-prs" && teamPrsQuery.dataUpdatedAt) {
      return getRelativeTime(
        new Date(teamPrsQuery.dataUpdatedAt).toISOString(),
      );
    }
    return "just now";
  })();

  const showEmptyPrompt =
    activeTab === "team-prs" && selectedMembers.length === 0;

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border/50">
        {TABS.map((tab) => {
          const count = getTabCount(tab.id);
          const countBadge = (
            <span
              className={cn(
                "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
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
          <div className="flex items-center gap-1 rounded-lg border border-border/50 p-0.5">
            <Button
              variant={prFilter === "all" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setPrFilter("all")}
            >
              All
            </Button>
            <Button
              variant={prFilter === "ready" ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setPrFilter("ready")}
            >
              Ready to merge
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            Last updated:{" "}
            <span className="font-mono">{lastUpdatedAt}</span>
          </span>
        </div>
      </div>

      {activeTab === "team-prs" && (
        <div className="mt-4">
          <MemberPicker />
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
              prFilter === "ready"
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
              <PRCard pr={pr} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
