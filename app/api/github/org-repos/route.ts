import { NextResponse, type NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";
import type { OrgRepo } from "@/features/dashboard/types/member-stats";

const GITHUB_NAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const MAX_QUERY_LENGTH = 100;
const PER_PAGE = 20;

type GitHubRepo = { name: string; description: string | null };

async function githubFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

/** Repos in an org: recently pushed when `q` is empty, otherwise a name search */
export async function GET(request: NextRequest) {
  const org = request.nextUrl.searchParams.get("org") ?? "";
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (!GITHUB_NAME.test(org)) {
    return NextResponse.json({ error: "Invalid 'org'" }, { status: 400 });
  }
  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const { data: token, error: tokenError } = await tryCatch(getGitHubToken());
  if (tokenError) {
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  const request$ = q
    ? githubFetch<{ items: GitHubRepo[] }>(
        `/search/repositories?q=${encodeURIComponent(`${q} in:name org:${org} fork:true`)}&sort=updated&per_page=${PER_PAGE}`,
        token,
      ).then((r) => r.items)
    : githubFetch<GitHubRepo[]>(
        `/orgs/${encodeURIComponent(org)}/repos?sort=pushed&per_page=${PER_PAGE}`,
        token,
      );

  const { data: repos, error } = await tryCatch(request$);
  if (error) {
    console.error("Failed to fetch org repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    repos.map(
      (r): OrgRepo => ({ name: r.name, description: r.description }),
    ),
  );
}
