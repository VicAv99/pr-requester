"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { useTeamConfig } from "@/hooks/use-team-config";
import { useMemberGroups } from "../hooks/use-member-groups";
import { useSelectedMembers } from "../hooks/use-selected-members";
import { setSelectedMembers } from "../utils/selected-members-storage";
import { addMemberGroup } from "../utils/member-groups-storage";
import { getUniqueMembers } from "../utils/get-unique-members";
import { GroupMemberList } from "./group-member-list";

export function GroupPicker() {
  const teamConfig = useTeamConfig();
  const groups = useMemberGroups();
  const selectedMembers = useSelectedMembers();
  const membersByLogin = useMemo(
    () => new Map(getUniqueMembers(teamConfig).map((m) => [m.login, m])),
    [teamConfig],
  );

  const activeGroup = useMemo(() => {
    if (selectedMembers.length === 0 || groups.length === 0) return null;
    const selectedSet = new Set(selectedMembers);
    return (
      groups.find((g) => {
        // Compare only selectable members (e.g. you, if you're not in a team)
        const members = g.members.filter((m) => membersByLogin.has(m));
        return (
          members.length === selectedSet.size &&
          members.every((m) => selectedSet.has(m))
        );
      }) ?? null
    );
  }, [groups, selectedMembers, membersByLogin]);

  const [createOpen, setCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState("");

  function applyGroup(members: string[]) {
    setSelectedMembers(members.filter((login) => membersByLogin.has(login)));
  }

  function handleSaveGroup() {
    const trimmed = groupName.trim();
    if (!trimmed || selectedMembers.length === 0) return;
    addMemberGroup(trimmed, selectedMembers);
    setGroupName("");
    setCreateOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderIcon className="size-3.5" />
              Groups
              <ChevronDownIcon className="size-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuLabel>Saved groups</DropdownMenuLabel>
            {groups.length === 0 ? (
              <DropdownMenuItem disabled>No saved groups yet</DropdownMenuItem>
            ) : (
              groups.map((group) => (
                <Tooltip key={group.id}>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem
                      onSelect={() => applyGroup(group.members)}
                    >
                      <span className="flex-1 truncate">{group.name}</span>
                      {/* Highlighted items force accent-foreground text; invert the badge to match */}
                      <Badge
                        variant="secondary"
                        className="ml-auto group-focus/dropdown-menu-item:bg-accent-foreground group-focus/dropdown-menu-item:text-accent!"
                      >
                        {group.members.length}
                      </Badge>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p className="mb-1.5 font-medium">{group.name}</p>
                    <GroupMemberList
                      logins={group.members}
                      membersByLogin={membersByLogin}
                      className="max-h-64 overflow-y-auto"
                    />
                  </TooltipContent>
                </Tooltip>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={selectedMembers.length === 0}
              onSelect={() => {
                setGroupName("");
                setCreateOpen(true);
              }}
            >
              <PlusIcon className="size-3.5" />
              Save current as group...
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/groups">
                <SettingsIcon className="size-3.5" />
                Manage groups
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {activeGroup && (
          <span className="text-sm text-muted-foreground">
            {activeGroup.name}
          </span>
        )}
        {selectedMembers.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setSelectedMembers([])}
          >
            <XIcon className="size-3" />
            Clear all
          </Button>
        )}
      </div>

      <AlertDialog open={createOpen} onOpenChange={setCreateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save group</AlertDialogTitle>
            <AlertDialogDescription>
              Save the current {selectedMembers.length} selected member
              {selectedMembers.length !== 1 ? "s" : ""} as a named group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveGroup();
              }
            }}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              disabled={!groupName.trim()}
              onClick={handleSaveGroup}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
