"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  PencilIcon,
  Trash2Icon,
  CheckIcon,
  XIcon,
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

type DialogMode = { type: "create" } | { type: "manage" } | null;

export function GroupPicker() {
  const teamConfig = useTeamConfig();
  const groups = useMemberGroups();
  const selectedMembers = useSelectedMembers();
  const allMembers = getUniqueMembers(teamConfig);
  const knownLogins = new Set(allMembers.map((m) => m.login));

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [groupName, setGroupName] = useState("");

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

  return (
    <>
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
              Rename or delete your saved member groups.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1">
            {groups.map((group) => (
              <GroupRow
                key={group.id}
                group={group}
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
    </>
  );
}

function GroupRow({
  group,
  onClose,
}: {
  group: { id: string; name: string; members: string[] };
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

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
            onClick={() => {
              setEditName(group.name);
              setEditing(true);
            }}
          >
            <PencilIcon className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "text-muted-foreground hover:text-destructive",
            )}
            onClick={handleDelete}
          >
            <Trash2Icon className="size-3" />
          </Button>
        </>
      )}
    </div>
  );
}
