"use client";

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
import { useTeamConfig } from "@/hooks/use-team-config";
import { useSelectedMembers } from "../hooks/use-selected-members";
import { setSelectedMembers } from "../utils/selected-members-storage";
import type { TeamConfig, TeamMember } from "@/types/team-config";

function getUniqueMembers(config: TeamConfig | null): TeamMember[] {
  if (!config) return [];
  const seen = new Map<string, TeamMember>();
  for (const team of config.teams) {
    for (const member of team.members) {
      if (!seen.has(member.login)) {
        seen.set(member.login, member);
      }
    }
  }
  return Array.from(seen.values());
}

export function MemberPicker() {
  const chipsRef = useComboboxAnchor();
  const teamConfig = useTeamConfig();
  const selectedLogins = useSelectedMembers();
  const allMembers = getUniqueMembers(teamConfig);

  if (allMembers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 p-4 text-center text-sm text-muted-foreground">
        No team members configured.{" "}
        <a
          href="/settings"
          className="text-primary underline underline-offset-2"
        >
          Configure your teams
        </a>{" "}
        to get started.
      </div>
    );
  }

  const memberMap = new Map(allMembers.map((m) => [m.login, m]));
  const allLogins = allMembers.map((m) => m.login);

  return (
    <Combobox
      multiple
      value={selectedLogins}
      onValueChange={(newValues) => setSelectedMembers(newValues)}
      items={allLogins}
    >
      <ComboboxChips ref={chipsRef}>
        {selectedLogins.map((login) => {
          const member = memberMap.get(login);
          return (
            <ComboboxChip key={login}>
              {member && (
                <img
                  src={member.avatar_url}
                  alt=""
                  className="size-4 rounded-full"
                />
              )}
              {login}
            </ComboboxChip>
          );
        })}
        <ComboboxChipsInput placeholder="Search team members..." />
      </ComboboxChips>
      <ComboboxContent anchor={chipsRef}>
        <ComboboxList>
          {(login: string) => {
            const member = memberMap.get(login);
            return (
              <ComboboxItem key={login} value={login}>
                {member && (
                  <img
                    src={member.avatar_url}
                    alt=""
                    className="size-5 rounded-full"
                  />
                )}
                {login}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
        <ComboboxEmpty>No members found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
