"use client";

import { useState } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HighlightMatch } from "@/components/highlight-match";
import { useTeamConfig } from "@/hooks/use-team-config";
import { useSelectedMembers } from "../hooks/use-selected-members";
import { setSelectedMembers } from "../utils/selected-members-storage";
import { getUniqueMembers } from "../utils/get-unique-members";

const MAX_VISIBLE_CHIPS = 3;

export function MemberPicker() {
  const chipsRef = useComboboxAnchor();
  const teamConfig = useTeamConfig();
  const selectedLogins = useSelectedMembers();
  const allMembers = getUniqueMembers(teamConfig);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  if (allMembers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
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
  const hasOverflow = selectedLogins.length > MAX_VISIBLE_CHIPS;
  const visibleLogins = expanded
    ? selectedLogins
    : selectedLogins.slice(0, MAX_VISIBLE_CHIPS);

  return (
    <Combobox
      multiple
      value={selectedLogins}
      onValueChange={(newValues) => setSelectedMembers(newValues)}
      onInputValueChange={(v) => setQuery(v)}
      items={allLogins}
      filter={(value, query) =>
        value.toLowerCase().includes(query.toLowerCase())
      }
    >
      <ComboboxChips ref={chipsRef}>
        {visibleLogins.map((login) => {
          const member = memberMap.get(login);
          return (
            <ComboboxChip key={login} className="border border-border bg-background">
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
        {hasOverflow && !expanded && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="flex h-[calc(--spacing(5.25))] items-center rounded-md border border-border bg-background px-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                +{selectedLogins.length - MAX_VISIBLE_CHIPS}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex flex-col gap-1.5 p-2">
              {selectedLogins.slice(MAX_VISIBLE_CHIPS).map((login) => {
                const member = memberMap.get(login);
                return (
                  <span key={login} className="flex items-center gap-1.5 text-xs">
                    {member && (
                      <img
                        src={member.avatar_url}
                        alt=""
                        className="size-4 rounded-full"
                      />
                    )}
                    {login}
                  </span>
                );
              })}
            </TooltipContent>
          </Tooltip>
        )}
        {hasOverflow && expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex h-[calc(--spacing(5.25))] items-center rounded-md border border-border bg-background px-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Show less
          </button>
        )}
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
                <HighlightMatch text={login} query={query} />
              </ComboboxItem>
            );
          }}
        </ComboboxList>
        <ComboboxEmpty>No members found</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
