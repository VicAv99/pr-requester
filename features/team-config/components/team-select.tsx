"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, UsersIcon } from "lucide-react";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { HighlightMatch } from "@/components/highlight-match";
import { teamConfigQueries } from "@/features/team-config/queries";

type TeamSelectProps = {
  org: string | null;
  value: string[];
  onValueChange: (teamSlugs: string[]) => void;
};

export function TeamSelect({
  org,
  value,
  onValueChange,
}: Readonly<TeamSelectProps>) {
  const chipsRef = useComboboxAnchor();
  const [query, setQuery] = useState("");
  const { data: teams, isLoading, error } = useQuery(
    teamConfigQueries.teams(org ?? ""),
  );

  const teamSlugs = teams?.map((t) => t.slug) ?? [];
  const teamMap = new Map(teams?.map((t) => [t.slug, t]) ?? []);
  const disabled = !org;

  return (
    <Field>
      <FieldLabel>Teams</FieldLabel>
      <FieldDescription>
        Select the teams you belong to. You can choose multiple teams.
      </FieldDescription>
      {disabled ? (
        <div className="flex h-9 items-center rounded-lg border px-3 text-sm text-muted-foreground">
          Select an organization first
        </div>
      ) : isLoading ? (
        <div className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading teams...
        </div>
      ) : error ? (
        <div className="flex h-9 items-center rounded-lg border border-destructive/50 bg-destructive/5 px-3 text-sm text-destructive">
          Failed to load teams: {error.message}
        </div>
      ) : (
        <Combobox
          multiple
          value={value}
          onValueChange={(newValues) => onValueChange(newValues)}
          onInputValueChange={(v) => setQuery(v)}
          items={teamSlugs}
          filter={(value, query) => {
            const q = query.toLowerCase();
            if (value.toLowerCase().includes(q)) return true;
            const team = teamMap.get(value);
            return team?.name.toLowerCase().includes(q) ?? false;
          }}
        >
          <ComboboxChips ref={chipsRef}>
            {value.map((slug) => {
              const team = teamMap.get(slug);
              return (
                <ComboboxChip key={slug}>
                  {team?.name ?? slug}
                </ComboboxChip>
              );
            })}
            <ComboboxChipsInput placeholder="Search teams..." />
          </ComboboxChips>
          <ComboboxContent anchor={chipsRef}>
            <ComboboxList>
              {(slug: string) => {
                const team = teamMap.get(slug);
                return (
                  <ComboboxItem key={slug} value={slug}>
                    <UsersIcon className="size-4 text-muted-foreground" />
                    <span>
                      <HighlightMatch text={team?.name ?? slug} query={query} />
                      <span className="ml-2 text-muted-foreground">
                        <HighlightMatch text={team?.slug ?? slug} query={query} />
                      </span>
                    </span>
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
            <ComboboxEmpty>No teams found in this organization</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      )}
    </Field>
  );
}
