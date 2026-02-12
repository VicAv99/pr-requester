import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { UserMenu } from "@/features/auth/components/user-menu";
import { TeamConfigForm } from "@/features/team-config/components/team-config-form";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-dot-grid min-h-screen">
      <div className="dashboard-gradient">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <DashboardHeader>
            <UserMenu user={session.user} />
          </DashboardHeader>
          <div className="mt-8 flex justify-center">
            <TeamConfigForm />
          </div>
        </div>
      </div>
    </div>
  );
}
