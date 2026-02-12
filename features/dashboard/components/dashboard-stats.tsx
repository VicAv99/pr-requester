"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardQueries } from "../queries";
import { useSelectedMembers } from "../hooks/use-selected-members";
import { StatsBar } from "./stats-bar";
import { NEEDS_TEAM_REVIEW } from "../constants/mock-data";

export function DashboardStats() {
  const selectedMembers = useSelectedMembers();
  const assignedQuery = useQuery(dashboardQueries.assigned());
  const teamPrsQuery = useQuery(dashboardQueries.teamPrs(selectedMembers));

  return (
    <StatsBar
      assignedCount={assignedQuery.data?.length ?? 0}
      teamPrsCount={teamPrsQuery.data?.length ?? 0}
      needsReviewCount={NEEDS_TEAM_REVIEW.length}
    />
  );
}
