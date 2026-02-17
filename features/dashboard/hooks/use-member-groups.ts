"use client";

import { useSyncExternalStore } from "react";
import type { MemberGroup } from "../types/member-group";

const STORAGE_KEY = "requester-member-groups";

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  // Listen for changes from other tabs
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", storageHandler);

  // Listen for changes within the same tab
  const customHandler = () => callback();
  window.addEventListener("member-groups-change", customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("member-groups-change", customHandler);
  };
}

export function useMemberGroups(): MemberGroup[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as MemberGroup[];
  } catch {
    return [];
  }
}
