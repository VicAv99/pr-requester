"use client";

import { useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useTeamConfig } from "@/hooks/use-team-config";
import type { TeamMember } from "@/types/team-config";
import { teamConfigQueries } from "../queries";
import { getTeamConfig, setTeamConfig } from "../utils/team-config-storage";

function sameMembers(a: TeamMember[], b: TeamMember[]): boolean {
  return (
    a.length === b.length &&
    a.every(
      (m, i) => m.login === b[i].login && m.avatar_url === b[i].avatar_url,
    )
  );
}

/**
 * Team members are saved as a snapshot when the config is saved. This
 * refetches them in the background and updates the snapshot when GitHub's
 * team membership has changed. Renders nothing.
 */
export function TeamMembersSync() {
  const config = useTeamConfig();
  const results = useQueries({
    queries: (config?.teams ?? []).map((team) =>
      teamConfigQueries.members(config?.org ?? "", team.slug),
    ),
  });

  const allLoaded =
    results.length > 0 && results.every((r) => r.isSuccess && r.data);
  // Stable signature of the fetched data so the effect only runs on new results
  const fetchedAt = results.map((r) => r.dataUpdatedAt).join(",");

  useEffect(() => {
    if (!allLoaded) return;
    // Read the latest saved config so a concurrent Settings save isn't clobbered
    const current = getTeamConfig();
    if (!current || current.org !== config?.org) return;

    let changed = false;
    const teams = current.teams.map((team) => {
      const index = config.teams.findIndex((t) => t.slug === team.slug);
      const fresh = index === -1 ? undefined : results[index]?.data;
      if (!fresh) return team;
      const members = fresh.map((m) => ({
        login: m.login,
        avatar_url: m.avatar_url,
      }));
      if (sameMembers(team.members, members)) return team;
      changed = true;
      return { ...team, members };
    });

    if (changed) setTeamConfig({ ...current, teams });
    // results is read through fetchedAt; listing it would rerun every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded, fetchedAt, config]);

  return null;
}
