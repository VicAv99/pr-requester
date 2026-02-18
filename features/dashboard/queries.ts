import { queryOptions } from "@tanstack/react-query";
import type { PullRequest } from "./types/dashboard";

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
};
