import { NextResponse, type NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";
import { transformGitHubPR } from "@/features/dashboard/utils/transform-github-pr";
import type {
  GitHubSearchResult,
  GitHubPRDetail,
  GitHubReview,
} from "@/features/dashboard/types/github-api";

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const url = path.startsWith("https://")
    ? path
    : `https://api.github.com${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const membersParam = request.nextUrl.searchParams.get("members");
  if (!membersParam) {
    return NextResponse.json(
      { error: "Missing 'members' query parameter" },
      { status: 400 },
    );
  }

  const memberLogins = membersParam
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (memberLogins.length === 0) {
    return NextResponse.json([]);
  }

  const { data: token, error: tokenError } = await tryCatch(getGitHubToken());
  if (tokenError) {
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  // Fetch current user login to exclude their own PRs
  const { data: user, error: userError } = await tryCatch(
    githubFetch<{ login: string }>("/user", token),
  );
  if (userError) {
    console.error("Failed to fetch team PRs:", userError);
    return NextResponse.json(
      { error: "Failed to fetch team pull requests" },
      { status: 502 },
    );
  }

  const filteredLogins = memberLogins.filter(
    (login) => login.toLowerCase() !== user.login.toLowerCase(),
  );

  if (filteredLogins.length === 0) {
    return NextResponse.json([]);
  }

  // GitHub Search API: multiple author: terms are OR'd together
  const authorTerms = filteredLogins.map((l) => `author:${l}`).join(" ");
  const query = `is:pr is:open ${authorTerms}`;

  const { data: searchResult, error: searchError } = await tryCatch(
    githubFetch<GitHubSearchResult>(
      `/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=100`,
      token,
    ),
  );
  if (searchError) {
    console.error("Failed to fetch team PRs:", searchError);
    return NextResponse.json(
      { error: "Failed to fetch team pull requests" },
      { status: 502 },
    );
  }

  // Enrich each PR with detail + reviews in parallel
  const enrichedPRs = await Promise.allSettled(
    searchResult.items.map(async (item) => {
      const ownerRepo = item.repository_url.split("/repos/")[1];

      const [detailResult, reviewsResult] = await Promise.allSettled([
        githubFetch<GitHubPRDetail>(
          `/repos/${ownerRepo}/pulls/${item.number}`,
          token,
        ),
        githubFetch<GitHubReview[]>(
          `/repos/${ownerRepo}/pulls/${item.number}/reviews`,
          token,
        ),
      ]);

      const detail =
        detailResult.status === "fulfilled" ? detailResult.value : null;
      const reviews =
        reviewsResult.status === "fulfilled" ? reviewsResult.value : [];

      return transformGitHubPR(item, detail, reviews);
    }),
  );

  const prs = enrichedPRs
    .filter(
      (r): r is PromiseFulfilledResult<ReturnType<typeof transformGitHubPR>> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value);

  return NextResponse.json(prs);
}
