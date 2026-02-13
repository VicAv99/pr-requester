import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-dot-grid flex min-h-screen items-center justify-center">
      <div className="dashboard-gradient absolute inset-0" />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-4 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <SearchXIcon className="size-6 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl italic tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-2">
          <Button asChild>
            <Link href="/">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
