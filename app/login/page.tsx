import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth-cookies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATLoginForm } from "@/features/auth/components/pat-login-form";

export default async function LoginPage() {
  const user = await getAuthUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="bg-dot-grid flex min-h-screen items-center justify-center">
      <div className="dashboard-gradient absolute inset-0" />
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl italic tracking-tight">
            Requester
          </CardTitle>
          <CardDescription>
            Enter your GitHub Personal Access Token to access your review
            dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PATLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
