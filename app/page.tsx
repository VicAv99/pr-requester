import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { UserMenu } from "@/features/auth/components/user-menu";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { PRTabList } from "@/features/dashboard/components/pr-tab-list";
import { TeamConfigBanner } from "@/features/team-config/components/team-config-banner";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="bg-dot-grid min-h-screen">
      <div className="dashboard-gradient">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <DashboardHeader>
            <UserMenu user={session?.user} />
          </DashboardHeader>
          <div className="mt-6">
            <TeamConfigBanner />
          </div>
          <div className="mt-8">
            <DashboardStats />
          </div>

          <div className="mt-8">
            <PRTabList />
          </div>
        </div>
      </div>
    </div>
  );
}
