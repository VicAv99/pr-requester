"use client";

import { useSyncExternalStore } from "react";
import type { TeamConfig } from "@/types/team-config";

const STORAGE_KEY = "requester-team-config";

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
  window.addEventListener("team-config-change", customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("team-config-change", customHandler);
  };
}

export function useTeamConfig(): TeamConfig | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TeamConfig;
  } catch {
    return null;
  }
}
