import { queryOptions } from "@tanstack/react-query";
import type { PullRequest } from "./types/dashboard";
import type { MemberStats, OrgRepo, StatsRange } from "./types/member-stats";

export const dashboardQueries = {
  all: () => ["dashboard"],

  viewer: () =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), "viewer"],
      queryFn: async (): Promise<{ login: string }> => {
        const res = await fetch("/api/github/user");
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      },
      staleTime: Infinity,
    }),

  assigned: () =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), "assigned"],
      queryFn: async (): Promise<PullRequest[]> => {
        const res = await fetch("/api/github/assigned-prs");
        if (!res.ok) throw new Error("Failed to fetch assigned PRs");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    }),

  teamPrs: (memberLogins: string[]) =>
    queryOptions({
      queryKey: [
        ...dashboardQueries.all(),
        "team-prs",
        [...memberLogins].sort(),
      ],
      queryFn: async (): Promise<PullRequest[]> => {
        if (memberLogins.length === 0) return [];
        const res = await fetch(
          `/api/github/team-prs?members=${encodeURIComponent(memberLogins.join(","))}`,
        );
        if (!res.ok) throw new Error("Failed to fetch team PRs");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
      enabled: memberLogins.length > 0,
    }),

  memberStats: (
    org: string,
    memberLogins: string[],
    range: StatsRange,
    repos: string[],
  ) =>
    queryOptions({
      queryKey: [
        ...dashboardQueries.all(),
        "member-stats",
        org,
        range,
        [...repos].sort((a, b) => a.localeCompare(b)),
        [...memberLogins].sort((a, b) => a.localeCompare(b)),
      ],
      queryFn: async (): Promise<MemberStats[]> => {
        const params = new URLSearchParams({
          org,
          range,
          members: memberLogins.join(","),
        });
        if (repos.length > 0) params.set("repos", repos.join(","));
        const res = await fetch(`/api/github/member-stats?${params}`);
        if (!res.ok) throw new Error("Failed to fetch member stats");
        return res.json();
      },
      staleTime: 15 * 60 * 1000,
      enabled: org.length > 0 && memberLogins.length > 0,
    }),

  orgRepos: (org: string, search: string) =>
    queryOptions({
      queryKey: [...dashboardQueries.all(), "org-repos", org, search],
      queryFn: async (): Promise<OrgRepo[]> => {
        const params = new URLSearchParams({ org, q: search });
        const res = await fetch(`/api/github/org-repos?${params}`);
        if (!res.ok) throw new Error("Failed to fetch repositories");
        return res.json();
      },
      staleTime: 10 * 60 * 1000,
      enabled: org.length > 0,
    }),
};
