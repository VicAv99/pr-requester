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

export type OrgRepo = {
  name: string;
  description: string | null;
};

export type MemberRepoActivity = {
  name: string;
  /** PRs this member opened in the repo (created in range) */
  authored: number;
  /** Other people's PRs this member reviewed in the repo (updated in range) */
  reviewed: number;
};

export type MemberRepos = {
  login: string;
  /** Sorted by authored + reviewed, highest first */
  repos: MemberRepoActivity[];
  /** True when the member has more PRs than were sampled (latest 100 of each kind) */
  truncated: boolean;
};
