import { queryOptions } from "@tanstack/react-query";
import type { PRDiffResponse } from "./types/pr-diff";

export const prDiffQueries = {
  all: () => ["pr-diff"],

  detail: (owner: string, repo: string, number: number) =>
    queryOptions({
      queryKey: [...prDiffQueries.all(), owner, repo, number],
      queryFn: async (): Promise<PRDiffResponse> => {
        const params = new URLSearchParams({
          owner,
          repo,
          number: String(number),
        });
        const res = await fetch(`/api/github/pr-diff?${params}`);
        if (!res.ok) throw new Error("Failed to fetch PR diff");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
    }),
};
