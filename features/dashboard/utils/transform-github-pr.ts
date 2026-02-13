import type {
  GitHubSearchItem,
  GitHubPRDetail,
  GitHubReview,
} from "../types/github-api";
import type { PullRequest, PRReviewer, ReviewStatus } from "../types/dashboard";

function mapGitHubReviewState(
  state: GitHubReview["state"],
): ReviewStatus | null {
  switch (state) {
    case "APPROVED":
      return "approved";
    case "CHANGES_REQUESTED":
      return "changes_requested";
    case "COMMENTED":
      return "commented";
    case "DISMISSED":
    case "PENDING":
      return null;
  }
}

function computeOverallStatus(reviewers: PRReviewer[]): ReviewStatus {
  if (reviewers.length === 0) return "pending";
  if (reviewers.some((r) => r.status === "changes_requested"))
    return "changes_requested";
  if (reviewers.every((r) => r.status === "approved")) return "approved";
  if (reviewers.some((r) => r.status === "commented")) return "commented";
  return "pending";
}

function parseOwnerRepo(repositoryUrl: string): string {
  // repositoryUrl is like "https://api.github.com/repos/acme/frontend"
  const parts = repositoryUrl.split("/repos/");
  return parts[1] ?? repositoryUrl;
}

export function transformGitHubPR(
  item: GitHubSearchItem,
  detail: GitHubPRDetail | null,
  reviews: GitHubReview[],
): PullRequest {
  // Build reviewers list: merge requested_reviewers (pending) with submitted reviews
  const reviewerMap = new Map<string, PRReviewer>();

  // Add requested reviewers as pending
  if (detail) {
    for (const reviewer of detail.requested_reviewers) {
      reviewerMap.set(reviewer.login, {
        username: reviewer.login,
        status: "pending",
      });
    }
  }

  // Add submitted reviews — take the latest review per user
  const sortedReviews = [...reviews].sort(
    (a, b) =>
      new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
  );
  for (const review of sortedReviews) {
    const status = mapGitHubReviewState(review.state);
    if (status) {
      reviewerMap.set(review.user.login, {
        username: review.user.login,
        status,
      });
    }
  }

  const reviewers = Array.from(reviewerMap.values());

  return {
    id: item.id,
    title: item.title,
    number: item.number,
    repo: parseOwnerRepo(item.repository_url),
    author: item.user.login,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    isDraft: item.draft,
    labels: item.labels.map((l) => ({ name: l.name, color: `#${l.color}` })),
    reviewStatus: computeOverallStatus(reviewers),
    reviewers,
    requestedTeams:
      detail?.requested_teams?.map((t) => ({ name: t.name, slug: t.slug })) ??
      [],
    additions: detail?.additions ?? 0,
    deletions: detail?.deletions ?? 0,
    changedFiles: detail?.changed_files ?? 0,
    url: item.pull_request.html_url,
  };
}
