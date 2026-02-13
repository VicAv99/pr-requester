/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect } from "react";
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-dot-grid flex min-h-screen items-center justify-center">
      <div className="dashboard-gradient absolute inset-0" />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-4 px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircleIcon className="size-6 text-destructive" />
        </div>
        <h1 className="font-display text-2xl italic tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Please try again or return to the
          dashboard.
        </p>
        <div className="mt-2 flex gap-3">
          <Button variant="outline" onClick={reset}>
            <RotateCcwIcon className="size-4" />
            Try again
          </Button>
          <Button asChild>
            <a href="/">Go to dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
