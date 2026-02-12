"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardQueries } from "../queries";
import { StatsBar } from "./stats-bar";
import { TEAM_PRS, NEEDS_TEAM_REVIEW } from "../constants/mock-data";

export function DashboardStats() {
  const assignedQuery = useQuery(dashboardQueries.assigned());

  return (
    <StatsBar
      assignedCount={assignedQuery.data?.length ?? 0}
      teamPrsCount={TEAM_PRS.length}
      needsReviewCount={NEEDS_TEAM_REVIEW.length}
    />
  );
}
