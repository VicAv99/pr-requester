import type { TeamConfig, TeamMember } from "@/types/team-config";

export function getUniqueMembers(config: TeamConfig | null): TeamMember[] {
  if (!config) return [];
  const seen = new Map<string, TeamMember>();
  for (const team of config.teams) {
    for (const member of team.members) {
      if (!seen.has(member.login)) {
        seen.set(member.login, member);
      }
    }
  }
  return Array.from(seen.values());
}
