"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookMarkedIcon, Loader2Icon } from "lucide-react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { HighlightMatch } from "@/components/highlight-match";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { dashboardQueries } from "../queries";

const MAX_REPOS = 10;

type RepoFilterProps = {
  org: string;
  value: string[];
  onChange: (repos: string[]) => void;
};

export function RepoFilter({ org, value, onChange }: RepoFilterProps) {
  const chipsRef = useComboboxAnchor();
  const [input, setInput] = useState("");
  // GitHub's repo search is rate limited; wait for typing to pause
  const search = useDebouncedValue(input.trim(), 300);
  const query = useQuery(dashboardQueries.orgRepos(org, search));

  const descriptions = new Map(
    query.data?.map((r) => [r.name, r.description]),
  );
  // Selected repos stay in the list so their chips render while searching
  const items = [
    ...value,
    ...(query.data?.map((r) => r.name).filter((n) => !value.includes(n)) ??
      []),
  ];
  const isSearching = query.isFetching || search !== input.trim();
  const atLimit = value.length >= MAX_REPOS;

  return (
    <Combobox
      multiple
      value={value}
      onValueChange={(next) => onChange(next.slice(0, MAX_REPOS))}
      onInputValueChange={(v) => setInput(v)}
      items={items}
      filter={null}
    >
      <ComboboxChips ref={chipsRef}>
        <BookMarkedIcon className="size-3.5 shrink-0 text-muted-foreground" />
        {value.map((repo) => (
          <ComboboxChip key={repo} className="border border-border bg-background">
            {repo}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          placeholder={value.length === 0 ? `All repos in ${org}` : "Add repo..."}
          aria-label="Filter by repository"
        />
        {isSearching && (
          <Loader2Icon className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        )}
      </ComboboxChips>
      <ComboboxContent anchor={chipsRef}>
        <ComboboxList>
          {(repo: string) => (
            <ComboboxItem
              key={repo}
              value={repo}
              disabled={atLimit && !value.includes(repo)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate">
                  <HighlightMatch text={repo} query={input} />
                </p>
                {descriptions.get(repo) && (
                  <p className="truncate text-xs text-muted-foreground">
                    {descriptions.get(repo)}
                  </p>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {query.isError
            ? "Couldn't load repositories"
            : isSearching
              ? "Searching..."
              : "No repositories found"}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
