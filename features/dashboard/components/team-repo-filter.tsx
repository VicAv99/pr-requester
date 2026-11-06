"use client";

import { BookMarkedIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RepoCount = {
  repo: string;
  count: number;
};

type TeamRepoFilterProps = {
  repos: RepoCount[];
  value: string[];
  onChange: (repos: string[]) => void;
};

export function TeamRepoFilter({ repos, value, onChange }: TeamRepoFilterProps) {
  // Keep selected repos visible even when no PRs currently match them,
  // so they can still be unchecked
  const known = new Set(repos.map((r) => r.repo));
  const items = [
    ...repos,
    ...value.filter((repo) => !known.has(repo)).map((repo) => ({ repo, count: 0 })),
  ];

  function toggle(repo: string, checked: boolean) {
    onChange(checked ? [...value, repo] : value.filter((r) => r !== repo));
  }

  const label =
    value.length === 0
      ? "All repos"
      : value.length === 1
        ? value[0].split("/")[1] ?? value[0]
        : `${value.length} repos`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(value.length > 0 && "border-primary/50")}
        >
          <BookMarkedIcon className="size-3.5" />
          <span className="max-w-40 truncate">{label}</span>
          <ChevronDownIcon className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-64 overflow-y-auto">
        <DropdownMenuLabel>Repositories with PRs</DropdownMenuLabel>
        {items.length === 0 ? (
          <DropdownMenuItem disabled>No repositories yet</DropdownMenuItem>
        ) : (
          items.map(({ repo, count }) => (
            <DropdownMenuCheckboxItem
              key={repo}
              checked={value.includes(repo)}
              onCheckedChange={(checked) => toggle(repo, checked)}
              // Keep the menu open so several repos can be picked in a row
              onSelect={(e) => e.preventDefault()}
            >
              <span className="flex-1 truncate font-mono text-xs">{repo}</span>
              <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                {count}
              </span>
            </DropdownMenuCheckboxItem>
          ))
        )}
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])}>
              <XIcon className="size-3.5" />
              Clear repo filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
