export const STATS_RANGES = ["30d", "90d", "1y", "all"] as const;

export type StatsRange = (typeof STATS_RANGES)[number];

export type MemberStats = {
  login: string;
  /** Currently open PRs created in range */
  open: number;
  /** PRs merged in range */
  merged: number;
  /** PRs closed without merging in range */
  closed: number;
  /** Other people's PRs this member reviewed, updated in range */
  reviewed: number;
};
