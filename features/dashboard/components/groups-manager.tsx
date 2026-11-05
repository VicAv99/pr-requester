"use client";

import { parseAsString, useQueryState } from "nuqs";
import { FolderIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeamConfig } from "@/hooks/use-team-config";
import type { TeamMember } from "@/types/team-config";
import { useMemberGroups } from "../hooks/use-member-groups";
import { getUniqueMembers } from "../utils/get-unique-members";
import { GroupEditor } from "./group-editor";
import { GroupMemberStats } from "./group-member-stats";

const NEW_GROUP = "new";

type GroupsManagerProps = {
  /** The signed-in user, always offered as a group member */
  viewer: TeamMember;
};

export function GroupsManager({ viewer }: GroupsManagerProps) {
  const teamConfig = useTeamConfig();
  const groups = useMemberGroups();
  const allMembers = [
    viewer,
    ...getUniqueMembers(teamConfig).filter((m) => m.login !== viewer.login),
  ];
  const membersByLogin = new Map(allMembers.map((m) => [m.login, m]));
  const [selectedId, setSelectedId] = useQueryState(
    "group",
    parseAsString.withDefault(""),
  );

  const selectedGroup = groups.find((g) => g.id === selectedId) ?? null;
  const isCreating = selectedId === NEW_GROUP;
  // Fall back to the first group so the editor is never empty when groups exist
  const activeGroup = isCreating ? null : (selectedGroup ?? groups[0] ?? null);
  const showEditor = isCreating || activeGroup !== null;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Saved groups</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedId(NEW_GROUP)}
          >
            <PlusIcon className="size-3.5" />
            New group
          </Button>
        </div>
        <nav className="space-y-1">
          {groups.map((group) => {
            const isActive = !isCreating && activeGroup?.id === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedId(group.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  isActive && "bg-muted font-medium",
                )}
              >
                <FolderIcon className="size-3.5 text-muted-foreground" />
                <span className="flex-1 truncate text-left">{group.name}</span>
                <Badge variant="secondary">{group.members.length}</Badge>
              </button>
            );
          })}
          {groups.length === 0 && !isCreating && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No groups yet.
            </p>
          )}
        </nav>
      </aside>

      <section className="min-w-0 space-y-6">
        {showEditor ? (
          <>
            <GroupEditor
              key={activeGroup?.id ?? NEW_GROUP}
              group={activeGroup}
              allMembers={allMembers}
              viewerLogin={viewer.login}
              onCreated={(id) => setSelectedId(id)}
              onDeleted={() => setSelectedId(null)}
            />
            {activeGroup && teamConfig && activeGroup.members.length > 0 && (
              <GroupMemberStats
                org={teamConfig.org}
                logins={activeGroup.members}
                viewerLogin={viewer.login}
                membersByLogin={membersByLogin}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <FolderIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Groups let you switch between sets of teammates in one click.
            </p>
            <Button size="sm" onClick={() => setSelectedId(NEW_GROUP)}>
              <PlusIcon className="size-3.5" />
              Create your first group
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
