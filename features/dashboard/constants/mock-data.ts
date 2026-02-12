import type { PullRequest } from "../types/dashboard";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const NEEDS_TEAM_REVIEW: PullRequest[] = [
  {
    id: 13,
    title: "Add SAML SSO integration for enterprise customers",
    number: 1840,
    repo: "acme/auth",
    author: "ext-sso-dev",
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(8),
    isDraft: false,
    labels: [
      { name: "feature", color: "#1d76db" },
      { name: "enterprise", color: "#6f42c1" },
    ],
    reviewStatus: "pending",
    reviewers: [{ username: "sarahchen", status: "commented" }],
    additions: 789,
    deletions: 56,
    url: "https://github.com/acme/auth/pull/1840",
  },
  {
    id: 14,
    title: "Upgrade to Node 22 LTS across all services",
    number: 1853,
    repo: "acme/infrastructure",
    author: "devops-bot",
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(14),
    isDraft: false,
    labels: [
      { name: "dependencies", color: "#0366d6" },
      { name: "infrastructure", color: "#008672" },
    ],
    reviewStatus: "pending",
    reviewers: [],
    additions: 23,
    deletions: 23,
    url: "https://github.com/acme/infrastructure/pull/1853",
  },
  {
    id: 15,
    title: "Implement audit logging for admin panel actions",
    number: 1835,
    repo: "acme/api-gateway",
    author: "security-team",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    isDraft: false,
    labels: [
      { name: "security", color: "#fbca04" },
      { name: "compliance", color: "#b8860b" },
    ],
    reviewStatus: "commented",
    reviewers: [
      { username: "jpark", status: "commented" },
      { username: "alexmartinez", status: "pending" },
    ],
    additions: 345,
    deletions: 12,
    url: "https://github.com/acme/api-gateway/pull/1835",
  },
  {
    id: 16,
    title: "Improve form component accessibility with ARIA labels",
    number: 1848,
    repo: "acme/ui-library",
    author: "a11y-team",
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(10),
    isDraft: false,
    labels: [
      { name: "accessibility", color: "#0e8a16" },
      { name: "design-system", color: "#d876e3" },
    ],
    reviewStatus: "pending",
    reviewers: [{ username: "emilyw", status: "pending" }],
    additions: 167,
    deletions: 89,
    url: "https://github.com/acme/ui-library/pull/1848",
  },
];
