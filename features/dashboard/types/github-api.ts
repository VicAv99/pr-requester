export type GitHubSearchResult = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchItem[];
};

export type GitHubSearchItem = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: {
    name: string;
    color: string;
  }[];
  pull_request: {
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
  repository_url: string;
};

export type GitHubPRDetail = {
  number: number;
  additions: number;
  deletions: number;
  requested_reviewers: {
    login: string;
    avatar_url: string;
  }[];
  requested_teams: {
    slug: string;
    name: string;
  }[];
};

export type GitHubReview = {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING";
  submitted_at: string;
};
