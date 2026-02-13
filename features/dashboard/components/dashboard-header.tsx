import { PropsWithChildren } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RefreshButton } from "@/features/dashboard/components/refresh-button";

export function DashboardHeader({ children }: Readonly<PropsWithChildren>) {
  return (
    <header className="flex items-end justify-between gap-6">
      <div>
        <h1 className="font-display text-3xl italic tracking-tight text-foreground">
          Requester
        </h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          GitHub Review Dashboard
        </p>
      </div>

      <div className="flex items-center gap-2">
        <RefreshButton />
        <ThemeToggle />
        {children && <div className="ml-1">{children}</div>}
      </div>
    </header>
  );
}
