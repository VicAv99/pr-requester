"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "requester-selected-members";

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
  window.addEventListener("selected-members-change", customHandler);

  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("selected-members-change", customHandler);
  };
}

export function useSelectedMembers(): string[] {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
