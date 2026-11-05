import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getAuthUser } from "@/lib/auth-cookies";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { GroupsManager } from "@/features/dashboard/components/groups-manager";
import { UserMenu } from "@/features/auth/components/user-menu";
import { TeamMembersSync } from "@/features/team-config/components/team-members-sync";

export default async function GroupsPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="bg-dot-grid min-h-screen">
      <TeamMembersSync />
      <div className="dashboard-gradient">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <DashboardHeader>
            <UserMenu user={user} />
          </DashboardHeader>
          <div className="mt-8 space-y-6">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeftIcon className="size-3.5" />
                Dashboard
              </Link>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Groups
              </h2>
            </div>
            <GroupsManager
              viewer={{ login: user.login, avatar_url: user.avatar_url }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
