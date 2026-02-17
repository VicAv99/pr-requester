import type { MemberGroup } from "../types/member-group";

const STORAGE_KEY = "requester-member-groups";

function notifyChange(): void {
  window.dispatchEvent(new Event("member-groups-change"));
}

export function getMemberGroups(): MemberGroup[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as MemberGroup[];
  } catch {
    return [];
  }
}

function setMemberGroups(groups: MemberGroup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  notifyChange();
}

export function addMemberGroup(
  name: string,
  members: string[],
): MemberGroup {
  const group: MemberGroup = {
    id: crypto.randomUUID(),
    name,
    members,
  };
  const groups = getMemberGroups();
  groups.push(group);
  setMemberGroups(groups);
  return group;
}

export function updateMemberGroup(
  id: string,
  updates: Partial<Pick<MemberGroup, "name" | "members">>,
): void {
  const groups = getMemberGroups();
  const index = groups.findIndex((g) => g.id === id);
  if (index === -1) return;
  groups[index] = { ...groups[index], ...updates };
  setMemberGroups(groups);
}

export function deleteMemberGroup(id: string): void {
  const groups = getMemberGroups().filter((g) => g.id !== id);
  setMemberGroups(groups);
}
