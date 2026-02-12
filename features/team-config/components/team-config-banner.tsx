"use client";

import Link from "next/link";
import { SettingsIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamConfig } from "@/hooks/use-team-config";

export function TeamConfigBanner() {
  const teamConfig = useTeamConfig();

  if (teamConfig) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <SettingsIcon className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Set up your team</p>
            <p className="text-xs text-muted-foreground">
              Configure your GitHub organization and teams to see relevant
              review requests.
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href="/settings">
            Configure
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
