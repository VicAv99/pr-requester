"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { PRCard } from "./pr-card";
import { PRCardSkeleton } from "./pr-card-skeleton";
import { PREmptyState } from "./pr-empty-state";
import { dashboardQueries } from "../queries";
import {
  TEAM_PRS,
  NEEDS_TEAM_REVIEW,
} from "../constants/mock-data";
import type { DashboardTab, PullRequest } from "../types/dashboard";
import { getRelativeTime } from "../utils/relative-time";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "assigned", label: "Assigned to Me" },
  { id: "team-prs", label: "My Team's PRs" },
  { id: "needs-review", label: "Needs Team Review" },
];

const EMPTY_MESSAGES: Record<DashboardTab, string> = {
  assigned: "No reviews assigned to you",
  "team-prs": "No open PRs from your team",
  "needs-review": "No PRs need your team's review",
};

export function PRTabList() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("assigned");

  const assignedQuery = useQuery(dashboardQueries.assigned());

  function getTabData(tabId: DashboardTab): PullRequest[] {
    switch (tabId) {
      case "assigned":
        return assignedQuery.data ?? [];
      case "team-prs":
        return TEAM_PRS;
      case "needs-review":
        return NEEDS_TEAM_REVIEW;
    }
  }

  function getTabCount(tabId: DashboardTab): number | undefined {
    if (tabId === "assigned") {
      return assignedQuery.isLoading ? undefined : assignedQuery.data?.length;
    }
    return getTabData(tabId).length;
  }

  const isLoading = activeTab === "assigned" && assignedQuery.isLoading;
  const currentData = getTabData(activeTab);

  const lastUpdatedAt =
    activeTab === "assigned" && assignedQuery.dataUpdatedAt
      ? getRelativeTime(new Date(assignedQuery.dataUpdatedAt).toISOString())
      : "just now";

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border/50">
        {TABS.map((tab) => {
          const count = getTabCount(tab.id);
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
              {activeTab === tab.id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}

        <div className="ml-auto text-xs text-muted-foreground">
          Last updated:{" "}
          <span className="font-mono">{lastUpdatedAt}</span>
        </div>
      </div>

      <div key={activeTab} className="mt-6 space-y-3 pb-12">
        {isLoading ? (
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
          <PREmptyState message={EMPTY_MESSAGES[activeTab]} />
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
