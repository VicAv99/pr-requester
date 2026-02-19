import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";

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

async function githubFetchText(
  path: string,
  token: string,
  accept: string,
): Promise<string> {
  const url = path.startsWith("https://")
    ? path
    : `https://api.github.com${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  return response.text();
}

type GitHubPRFile = {
  sha: string;
  filename: string;
  status:
    | "added"
    | "removed"
    | "modified"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previous_filename?: string;
};

type GitHubPRInfo = {
  title: string;
  number: number;
  html_url: string;
  state: string;
  draft: boolean;
  user: { login: string; avatar_url: string };
  base: { ref: string; label: string };
  head: { ref: string; label: string };
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const number = searchParams.get("number");

  if (!owner || !repo || !number) {
    return NextResponse.json(
      { error: "Missing owner, repo, or number" },
      { status: 400 },
    );
  }

  const { data: token, error: tokenError } = await tryCatch(getGitHubToken());
  if (tokenError) {
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  const prPath = `/repos/${owner}/${repo}/pulls/${number}`;

  const [prResult, filesResult, diffResult] = await Promise.allSettled([
    githubFetch<GitHubPRInfo>(prPath, token),
    githubFetch<GitHubPRFile[]>(`${prPath}/files?per_page=100`, token),
    githubFetchText(prPath, token, "application/vnd.github.diff"),
  ]);

  if (prResult.status === "rejected") {
    return NextResponse.json(
      { error: "Failed to fetch PR info" },
      { status: 502 },
    );
  }

  const pr = prResult.value;
  const files = filesResult.status === "fulfilled" ? filesResult.value : [];
  const diff = diffResult.status === "fulfilled" ? diffResult.value : "";

  return NextResponse.json({
    pr: {
      title: pr.title,
      number: pr.number,
      url: pr.html_url,
      state: pr.state,
      isDraft: pr.draft,
      author: pr.user.login,
      authorAvatar: pr.user.avatar_url,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    },
    files: files.map((f) => ({
      sha: f.sha,
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      previousFilename: f.previous_filename,
    })),
    diff,
  });
}
