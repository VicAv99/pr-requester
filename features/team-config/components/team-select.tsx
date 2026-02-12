"use client";

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
  const { data: teams, isLoading, error } = useQuery(
    teamConfigQueries.teams(org ?? ""),
  );

  const teamSlugs = teams?.map((t) => t.slug) ?? [];
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
          items={teamSlugs}
        >
          <ComboboxChips ref={chipsRef}>
            {value.map((slug) => {
              const team = teams?.find((t) => t.slug === slug);
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
              {teams?.map((team) => (
                <ComboboxItem key={team.slug} value={team.slug}>
                  <UsersIcon className="size-4 text-muted-foreground" />
                  <span>
                    {team.name}
                    <span className="ml-2 text-muted-foreground">
                      {team.slug}
                    </span>
                  </span>
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No teams found in this organization</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      )}
    </Field>
  );
}
