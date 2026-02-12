import { queryOptions } from "@tanstack/react-query";
import type { GitHubOrg, GitHubTeam, TeamMember } from "@/types/team-config";

export const teamConfigQueries = {
  all: () => ["team-config"],

  orgs: () =>
    queryOptions({
      queryKey: [...teamConfigQueries.all(), "orgs"],
      queryFn: async (): Promise<GitHubOrg[]> => {
        const res = await fetch("/api/github/orgs");
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      },
      staleTime: 10 * 60 * 1000,
    }),

  teams: (org: string) =>
    queryOptions({
      queryKey: [...teamConfigQueries.all(), "teams", org],
      queryFn: async (): Promise<GitHubTeam[]> => {
        const res = await fetch(
          `/api/github/teams?org=${encodeURIComponent(org)}`,
        );
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!org,
    }),

  members: (org: string, teamSlug: string) =>
    queryOptions({
      queryKey: [...teamConfigQueries.all(), "members", org, teamSlug],
      queryFn: async (): Promise<TeamMember[]> => {
        const res = await fetch(
          `/api/github/members?org=${encodeURIComponent(org)}&team=${encodeURIComponent(teamSlug)}`,
        );
        if (!res.ok) throw new Error("Failed to fetch team members");
        return res.json();
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!org && !!teamSlug,
    }),
};
