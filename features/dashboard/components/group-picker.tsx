"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
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
  PencilIcon,
  Trash2Icon,
  CheckIcon,
  XIcon,
  UsersIcon,
} from "lucide-react";
import { useTeamConfig } from "@/hooks/use-team-config";
import { useMemberGroups } from "../hooks/use-member-groups";
import { useSelectedMembers } from "../hooks/use-selected-members";
import { setSelectedMembers } from "../utils/selected-members-storage";
import {
  addMemberGroup,
  updateMemberGroup,
  deleteMemberGroup,
} from "../utils/member-groups-storage";
import { getUniqueMembers } from "../utils/get-unique-members";

type DialogMode =
  | { type: "create" }
  | { type: "manage" }
  | { type: "edit"; groupId: string }
  | null;

export function GroupPicker() {
  const teamConfig = useTeamConfig();
  const groups = useMemberGroups();
  const selectedMembers = useSelectedMembers();
  const allMembers = getUniqueMembers(teamConfig);
  const knownLogins = new Set(allMembers.map((m) => m.login));

  const activeGroup = useMemo(() => {
    if (selectedMembers.length === 0 || groups.length === 0) return null;
    const selectedSet = new Set(selectedMembers);
    return groups.find(
      (g) =>
        g.members.length === selectedSet.size &&
        g.members.every((m) => selectedSet.has(m)),
    ) ?? null;
  }, [groups, selectedMembers]);

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [groupName, setGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupMembers, setEditGroupMembers] = useState<string[]>([]);
  const [editMemberSearch, setEditMemberSearch] = useState("");

  const filteredEditMembers = editMemberSearch
    ? allMembers.filter((m) =>
        m.login.toLowerCase().includes(editMemberSearch.toLowerCase()),
      )
    : allMembers;

  function applyGroup(members: string[]) {
    const validMembers = members.filter((login) => knownLogins.has(login));
    setSelectedMembers(validMembers);
  }

  function handleSaveGroup() {
    const trimmed = groupName.trim();
    if (!trimmed || selectedMembers.length === 0) return;
    addMemberGroup(trimmed, selectedMembers);
    setGroupName("");
    setDialogMode(null);
  }

  function handleStartEdit(groupId: string) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setEditGroupName(group.name);
    setEditGroupMembers(
      group.members.filter((login) => knownLogins.has(login)),
    );
    setEditMemberSearch("");
    setDialogMode({ type: "edit", groupId });
  }

  function handleSaveEdit() {
    if (dialogMode?.type !== "edit") return;
    const trimmed = editGroupName.trim();
    if (!trimmed || editGroupMembers.length === 0) return;
    updateMemberGroup(dialogMode.groupId, {
      name: trimmed,
      members: editGroupMembers,
    });
    setDialogMode({ type: "manage" });
  }

  function toggleEditMember(login: string) {
    setEditGroupMembers((prev) =>
      prev.includes(login)
        ? prev.filter((l) => l !== login)
        : [...prev, login],
    );
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
              <DropdownMenuItem
                key={group.id}
                onSelect={() => applyGroup(group.members)}
              >
                <span className="flex-1 truncate">{group.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {group.members.length}
                </Badge>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={selectedMembers.length === 0}
            onSelect={() => {
              setGroupName("");
              setDialogMode({ type: "create" });
            }}
          >
            <PlusIcon className="size-3.5" />
            Save current as group...
          </DropdownMenuItem>
          {groups.length > 0 && (
            <DropdownMenuItem
              onSelect={() => setDialogMode({ type: "manage" })}
            >
              <SettingsIcon className="size-3.5" />
              Manage groups...
            </DropdownMenuItem>
          )}
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

      {/* Create group dialog */}
      <AlertDialog
        open={dialogMode?.type === "create"}
        onOpenChange={(open) => {
          if (!open) setDialogMode(null);
        }}
      >
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

      {/* Manage groups dialog */}
      <AlertDialog
        open={dialogMode?.type === "manage"}
        onOpenChange={(open) => {
          if (!open) setDialogMode(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manage groups</AlertDialogTitle>
            <AlertDialogDescription>
              Edit, rename, or delete your saved member groups.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1">
            {groups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
                onEdit={() => handleStartEdit(group.id)}
                onClose={() => {
                  if (groups.length <= 1) setDialogMode(null);
                }}
              />
            ))}
            {groups.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No groups yet.
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Done</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit group dialog */}
      <AlertDialog
        open={dialogMode?.type === "edit"}
        onOpenChange={(open) => {
          if (!open) setDialogMode({ type: "manage" });
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit group</AlertDialogTitle>
            <AlertDialogDescription>
              Update the name and members of this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Group name"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Members</span>
                <Badge variant="secondary">
                  {editGroupMembers.length} selected
                </Badge>
              </div>
              <Input
                placeholder="Search members..."
                value={editMemberSearch}
                onChange={(e) => setEditMemberSearch(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {filteredEditMembers.map((member) => {
                  const isSelected = editGroupMembers.includes(member.login);
                  return (
                    <button
                      key={member.login}
                      type="button"
                      onClick={() => toggleEditMember(member.login)}
                      className={cn(
                        "flex w-full items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                        isSelected && "bg-accent/50",
                      )}
                    >
                      <img
                        src={member.avatar_url}
                        alt=""
                        className="size-5 rounded-full"
                      />
                      <span className="flex-1 truncate text-left">
                        {member.login}
                      </span>
                      {isSelected && (
                        <CheckIcon className="size-3.5 text-primary" />
                      )}
                    </button>
                  );
                })}
                {filteredEditMembers.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No members found.
                  </p>
                )}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              size="sm"
              disabled={
                !editGroupName.trim() || editGroupMembers.length === 0
              }
              onClick={handleSaveEdit}
            >
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function GroupRow({
  group,
  onEdit,
  onClose,
}: {
  group: { id: string; name: string; members: string[] };
  onEdit: () => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [holdingDelete, setHoldingDelete] = useState(false);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HOLD_DURATION = 1500;
  const PROGRESS_R = 9;
  const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_R;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  function handleRename() {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditName(group.name);
      setEditing(false);
      return;
    }
    updateMemberGroup(group.id, { name: trimmed });
    setEditing(false);
  }

  function handleDelete() {
    deleteMemberGroup(group.id);
    onClose();
  }

  const startDeleteHold = useCallback(() => {
    setHoldingDelete(true);
    deleteTimerRef.current = setTimeout(() => {
      setHoldingDelete(false);
      handleDelete();
    }, HOLD_DURATION);
  }, [group.id]);

  const cancelDeleteHold = useCallback(() => {
    setHoldingDelete(false);
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
      {editing ? (
        <div className="flex flex-1 items-center gap-1">
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRename();
              }
              if (e.key === "Escape") {
                setEditName(group.name);
                setEditing(false);
              }
            }}
            className="h-7 text-sm"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleRename}
            disabled={!editName.trim()}
          >
            <CheckIcon className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setEditName(group.name);
              setEditing(false);
            }}
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate text-sm">{group.name}</span>
          <Badge variant="secondary">{group.members.length}</Badge>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onEdit}
          >
            <UsersIcon className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setEditName(group.name);
              setEditing(true);
            }}
          >
            <PencilIcon className="size-3" />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="relative inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
                onPointerDown={startDeleteHold}
                onPointerUp={cancelDeleteHold}
                onPointerLeave={cancelDeleteHold}
                onPointerCancel={cancelDeleteHold}
              >
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r={PROGRESS_R}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={PROGRESS_CIRCUMFERENCE}
                    strokeDashoffset={
                      holdingDelete ? 0 : PROGRESS_CIRCUMFERENCE
                    }
                    className="text-destructive"
                    style={{
                      transition: holdingDelete
                        ? `stroke-dashoffset ${HOLD_DURATION}ms linear`
                        : "stroke-dashoffset 150ms ease-out",
                    }}
                  />
                </svg>
                <Trash2Icon className="relative size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Hold to delete</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  );
}
