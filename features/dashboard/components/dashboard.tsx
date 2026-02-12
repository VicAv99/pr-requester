"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "./dashboard-header";
import { StatsBar } from "./stats-bar";
import { PRCard } from "./pr-card";
import {
  ASSIGNED_TO_ME,
  TEAM_PRS,
  NEEDS_TEAM_REVIEW,
} from "../constants/mock-data";
import type { DashboardTab, PullRequest } from "../types/dashboard";

const TABS: { id: DashboardTab; label: string; data: PullRequest[] }[] = [
  { id: "assigned", label: "Assigned to Me", data: ASSIGNED_TO_ME },
  { id: "team-prs", label: "My Team's PRs", data: TEAM_PRS },
  { id: "needs-review", label: "Needs Team Review", data: NEEDS_TEAM_REVIEW },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("assigned");

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="bg-dot-grid min-h-screen">
      <div className="dashboard-gradient">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {/* Header */}
          <DashboardHeader />

          {/* Stats */}
          <div className="mt-8">
            <StatsBar
              assignedCount={ASSIGNED_TO_ME.length}
              teamPrsCount={TEAM_PRS.length}
              needsReviewCount={NEEDS_TEAM_REVIEW.length}
            />
          </div>

          {/* Tabs */}
          <div className="mt-8 flex items-center gap-1 border-b border-border/50">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.data.length}
                </span>
                {activeTab === tab.id && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}

            <div className="ml-auto text-xs text-muted-foreground">
              Last updated:{" "}
              <span className="font-mono">just now</span>
            </div>
          </div>

          {/* PR List */}
          <div key={activeTab} className="mt-6 space-y-3 pb-12">
            {currentTab.data.map((pr, i) => (
              <div
                key={pr.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <PRCard pr={pr} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
