export type GitHubOrg = {
  login: string;
  avatar_url: string;
  description: string | null;
};

export type GitHubTeam = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type TeamMember = {
  login: string;
  avatar_url: string;
};

export type TeamWithMembers = {
  slug: string;
  name: string;
  members: TeamMember[];
};

export type TeamConfig = {
  org: string;
  orgAvatarUrl: string;
  teams: TeamWithMembers[];
};
