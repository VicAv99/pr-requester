"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { teamConfigQueries } from "@/features/team-config/queries";
import type { GitHubOrg } from "@/types/team-config";

type OrgSelectProps = {
  value: string | null;
  onValueChange: (org: GitHubOrg | null) => void;
};

export function OrgSelect({ value, onValueChange }: Readonly<OrgSelectProps>) {
  const { data: orgs, isLoading, error } = useQuery(teamConfigQueries.orgs());

  const orgLogins = orgs?.map((o) => o.login) ?? [];

  return (
    <Field>
      <FieldLabel>Organization</FieldLabel>
      <FieldDescription>
        Select the GitHub organization your team belongs to
      </FieldDescription>
      {isLoading ? (
        <div className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading organizations...
        </div>
      ) : error ? (
        <div className="flex h-9 items-center rounded-lg border border-destructive/50 bg-destructive/5 px-3 text-sm text-destructive">
          Failed to load organizations. Please try refreshing.
        </div>
      ) : (
        <Combobox
          value={value}
          onValueChange={(newValue) => {
            const org = orgs?.find((o) => o.login === newValue) ?? null;
            onValueChange(org);
          }}
          items={orgLogins}
        >
          <ComboboxInput placeholder="Search organizations..." />
          <ComboboxContent>
            <ComboboxList>
              {orgs?.map((org) => (
                <ComboboxItem key={org.login} value={org.login}>
                  <Image
                    src={org.avatar_url}
                    alt={org.login}
                    width={20}
                    height={20}
                    className="size-5 rounded"
                  />
                  {org.login}
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No organizations found</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      )}
    </Field>
  );
}
