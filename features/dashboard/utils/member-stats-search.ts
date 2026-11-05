import type { MemberStats, StatsRange } from "../types/member-stats";

export type StatKey = Exclude<keyof MemberStats, "login">;

export const STAT_KEYS: readonly StatKey[] = [
  "open",
  "merged",
  "closed",
  "reviewed",
];

const RANGE_DAYS: Record<Exclude<StatsRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** ISO date (YYYY-MM-DD) for the start of the range, or null for all time */
export function statsSinceDate(range: StatsRange, now = Date.now()): string | null {
  if (range === "all") return null;
  const date = new Date(now - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

type StatSearchInput = {
  key: StatKey;
  login: string;
  org: string;
  /** Repo names within `org`; empty means the whole org */
  repos: string[];
  since: string | null;
};

/**
 * GitHub search query backing one stat. Multiple `repo:` qualifiers are OR'd
 * by GitHub search, so they replace the `org:` scope when present.
 */
export function buildStatSearch({
  key,
  login,
  org,
  repos,
  since,
}: StatSearchInput): string {
  const scope =
    repos.length > 0
      ? repos.map((r) => `repo:${org}/${r}`).join(" ")
      : `org:${org}`;
  const base = `is:pr ${scope}`;

  switch (key) {
    case "open":
      return `${base} author:${login} is:open${since ? ` created:>=${since}` : ""}`;
    case "merged":
      return `${base} author:${login} is:merged${since ? ` merged:>=${since}` : ""}`;
    case "closed":
      return `${base} author:${login} is:closed is:unmerged${since ? ` closed:>=${since}` : ""}`;
    case "reviewed":
      return `${base} reviewed-by:${login} -author:${login}${since ? ` updated:>=${since}` : ""}`;
  }
}

/** Searches whose results are tallied by repo for the per-member repo breakdown */
export function buildRepoBreakdownSearch(
  kind: "authored" | "reviewed",
  login: string,
  org: string,
  since: string | null,
): string {
  const who =
    kind === "authored" ? `author:${login}` : `reviewed-by:${login} -author:${login}`;
  const dateField = kind === "authored" ? "created" : "updated";
  const when = since ? ` ${dateField}:>=${since}` : "";
  return `is:pr org:${org} ${who}${when}`;
}
