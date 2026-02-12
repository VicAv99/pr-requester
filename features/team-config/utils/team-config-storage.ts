import type { TeamConfig } from "@/types/team-config";

const STORAGE_KEY = "requester-team-config";
const COOKIE_NAME = "team-config";

export function getTeamConfig(): TeamConfig | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TeamConfig;
  } catch {
    return null;
  }
}

export function setTeamConfig(config: TeamConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

  // Mirror minimal data to cookie for server-side access
  const cookieValue = JSON.stringify({
    org: config.org,
    teams: config.teams.map((t) => t.slug),
  });
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cookieValue)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;

  // Notify same-tab listeners
  window.dispatchEvent(new Event("team-config-change"));
}

export function clearTeamConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=;path=/;max-age=0`;

  window.dispatchEvent(new Event("team-config-change"));
}

export function hasTeamConfig(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}
