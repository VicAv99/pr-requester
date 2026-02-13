export type ReviewStatus =
  | "approved"
  | "changes_requested"
  | "pending"
  | "commented";

export type PRLabel = {
  name: string;
  color: string;
};

export type PRReviewer = {
  username: string;
  status: ReviewStatus;
};

export type PullRequest = {
  id: number;
  title: string;
  number: number;
  repo: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  labels: PRLabel[];
  reviewStatus: ReviewStatus;
  reviewers: PRReviewer[];
  requestedTeams: { name: string; slug: string }[];
  additions: number;
  deletions: number;
  url: string;
};

export type DashboardTab = "assigned" | "team-prs";
