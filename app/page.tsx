import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { StatsBar } from "@/features/dashboard/components/stats-bar";
import { PRTabList } from "@/features/dashboard/components/pr-tab-list";
import {
  ASSIGNED_TO_ME,
  TEAM_PRS,
  NEEDS_TEAM_REVIEW,
} from "@/features/dashboard/constants/mock-data";

export default function Page() {
  return (
    <div className="bg-dot-grid min-h-screen">
      <div className="dashboard-gradient">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <DashboardHeader />

          <div className="mt-8">
            <StatsBar
              assignedCount={ASSIGNED_TO_ME.length}
              teamPrsCount={TEAM_PRS.length}
              needsReviewCount={NEEDS_TEAM_REVIEW.length}
            />
          </div>

          <div className="mt-8">
            <PRTabList />
          </div>
        </div>
      </div>
    </div>
  );
}
