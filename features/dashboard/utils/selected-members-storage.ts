const STORAGE_KEY = "requester-selected-members";

export function getSelectedMembers(): string[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function setSelectedMembers(logins: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logins));

  // Notify same-tab listeners
  window.dispatchEvent(new Event("selected-members-change"));
}
