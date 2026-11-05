"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutDashboardIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { TeamMember } from "@/types/team-config";
import type { MemberGroup } from "../types/member-group";
import {
  addMemberGroup,
  deleteMemberGroup,
  updateMemberGroup,
} from "../utils/member-groups-storage";
import { setSelectedMembers } from "../utils/selected-members-storage";
import { HoldToDeleteButton } from "./hold-to-delete-button";
import { UserAvatar } from "./user-avatar";

type GroupEditorProps = {
  /** `null` creates a new group */
  group: MemberGroup | null;
  allMembers: TeamMember[];
  viewerLogin: string;
  onCreated: (id: string) => void;
  onDeleted: () => void;
};

export function GroupEditor({
  group,
  allMembers,
  viewerLogin,
  onCreated,
  onDeleted,
}: GroupEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(group?.name ?? "");
  const [members, setMembers] = useState<string[]>(group?.members ?? []);
  const [query, setQuery] = useState("");
  const chipsRef = useComboboxAnchor();

  const membersByLogin = new Map(allMembers.map((m) => [m.login, m]));
  const knownLogins = new Set(membersByLogin.keys());
  // Keep saved members that left the team selectable so their chips render
  const itemLogins = [
    ...allMembers.map((m) => m.login),
    ...members.filter((login) => !knownLogins.has(login)),
  ];

  const trimmedName = name.trim();
  const isNew = group === null;
  const isDirty =
    isNew ||
    trimmedName !== group.name ||
    members.length !== group.members.length ||
    members.some((m) => !group.members.includes(m));
  const canSave = trimmedName.length > 0 && members.length > 0 && isDirty;

  function handleSave() {
    if (!canSave) return;
    if (isNew) {
      const created = addMemberGroup(trimmedName, members);
      onCreated(created.id);
      return;
    }
    updateMemberGroup(group.id, { name: trimmedName, members });
  }

  function handleReset() {
    setName(group?.name ?? "");
    setMembers(group?.members ?? []);
  }

  function handleUseOnDashboard() {
    setSelectedMembers(members.filter((login) => knownLogins.has(login)));
    router.push("/?tab=team-prs");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isNew ? "New group" : group.name}</CardTitle>
        <CardDescription>
          {isNew
            ? "Name the group and pick its members."
            : `${group.members.length} member${group.members.length !== 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="group-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="group-name"
            placeholder="e.g. Frontend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={isNew}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Members</span>
            <Badge variant="secondary">{members.length} selected</Badge>
          </div>
          <Combobox
            multiple
            value={members}
            onValueChange={(next) => setMembers(next)}
            onInputValueChange={(v) => setQuery(v)}
            items={itemLogins}
            filter={(value, q) => value.toLowerCase().includes(q.toLowerCase())}
          >
            <ComboboxChips ref={chipsRef} className="min-h-10 py-1.5">
              {members.map((login) => {
                const member = membersByLogin.get(login);
                return (
                  <ComboboxChip
                    key={login}
                    className={cn(
                      "border border-border bg-background",
                      !member && "text-muted-foreground",
                    )}
                  >
                    <MemberAvatar login={login} member={member} size={16} />
                    {login}
                  </ComboboxChip>
                );
              })}
              <ComboboxChipsInput
                placeholder={
                  members.length === 0 ? "Search team members..." : "Add more..."
                }
              />
            </ComboboxChips>
            <ComboboxContent anchor={chipsRef}>
              <ComboboxList>
                {(login: string) => (
                  <ComboboxItem key={login} value={login}>
                    <MemberAvatar
                      login={login}
                      member={membersByLogin.get(login)}
                      size={20}
                    />
                    <span className="flex-1 truncate">
                      <HighlightMatch text={login} query={query} />
                      {login === viewerLogin && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </span>
                  </ComboboxItem>
                )}
              </ComboboxList>
              <ComboboxEmpty>
                {allMembers.length === 0
                  ? "No team configured. Set one up in Settings."
                  : "No members found"}
              </ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!canSave} onClick={handleSave}>
          {isNew ? "Create group" : "Save changes"}
        </Button>
        {!isNew && isDirty && (
          <Button size="sm" variant="ghost" onClick={handleReset}>
            Discard
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          {!isNew && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={members.length === 0}
                onClick={handleUseOnDashboard}
              >
                <LayoutDashboardIcon className="size-3.5" />
                Use on dashboard
              </Button>
              <HoldToDeleteButton
                label="Hold to delete group"
                onDelete={() => {
                  deleteMemberGroup(group.id);
                  onDeleted();
                }}
              />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function MemberAvatar({
  login,
  member,
  size,
}: {
  login: string;
  member: TeamMember | undefined;
  size: 16 | 20;
}) {
  const sizeClass = size === 16 ? "size-4" : "size-5";
  if (!member) return <UserAvatar username={login} className={sizeClass} />;
  return (
    <Image
      width={size}
      height={size}
      src={member.avatar_url}
      alt=""
      className={cn(sizeClass, "rounded-full")}
    />
  );
}
