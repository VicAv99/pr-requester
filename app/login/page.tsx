import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitHubLoginButton } from "@/features/auth/components/github-login-button";

export default function LoginPage() {
  return (
    <div className="bg-dot-grid flex min-h-screen items-center justify-center">
      <div className="dashboard-gradient absolute inset-0" />
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl italic tracking-tight">
            Requester
          </CardTitle>
          <CardDescription>
            Sign in to access your GitHub review dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GitHubLoginButton />
        </CardContent>
      </Card>
    </div>
  );
}
