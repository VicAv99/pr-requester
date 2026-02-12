import { type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type DashboardHeaderProps = {
  userSlot?: ReactNode;
};

export function DashboardHeader({ userSlot }: Readonly<DashboardHeaderProps>) {
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
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pull requests..."
            className="h-8 w-64 pl-8 text-xs"
          />
        </div>
        <Button variant="outline" size="icon-sm" title="Refresh">
          <RefreshCwIcon className="size-3.5" />
        </Button>
        <ThemeToggle />
        {userSlot && <div className="ml-1">{userSlot}</div>}
      </div>
    </header>
  );
}
