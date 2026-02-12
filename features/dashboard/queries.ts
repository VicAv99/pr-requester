import { queryOptions } from "@tanstack/react-query";
import type { PullRequest } from "./types/dashboard";

export const dashboardQueries = {
  all: () => ["dashboard"],

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
};
