import { NextResponse, type NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";
import {
  STATS_RANGES,
  type RepoStats,
  type StatsRange,
} from "@/features/dashboard/types/member-stats";
import {
  STAT_KEYS,
  buildStatSearch,
  statsSinceDate,
} from "@/features/dashboard/utils/member-stats-search";

const GITHUB_NAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})(?:\[bot\])?$/;
const REPO_NAME = /^[A-Za-z0-9._-]{1,100}$/;
const MAX_REPOS = 20;
// Each repo needs 4 searches; keep each GraphQL request to a modest size
const REPOS_PER_REQUEST = 10;

type GraphQLResponse = {
  data?: Record<string, { issueCount: number }>;
  errors?: { message: string }[];
};

async function fetchRepoStatsChunk(
  repos: string[],
  login: string,
  org: string,
  since: string | null,
  token: string,
): Promise<RepoStats[]> {
  const variables: Record<string, string> = {};
  const declarations: string[] = [];
  const fields: string[] = [];

  repos.forEach((repo, i) => {
    for (const key of STAT_KEYS) {
      const name = `${key}${i}`;
      variables[name] = buildStatSearch({ key, login, org, repos: [repo], since });
      declarations.push(`$${name}: String!`);
      fields.push(
        `${name}: search(type: ISSUE, query: $${name}, first: 0) { issueCount }`,
      );
    }
  });

  const query = `query(${declarations.join(", ")}) { ${fields.join(" ")} }`;
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL error ${response.status}: ${await response.text()}`);
  }
  const body = (await response.json()) as GraphQLResponse;
  if (!body.data) {
    throw new Error(
      `GitHub GraphQL error: ${body.errors?.map((e) => e.message).join("; ") ?? "no data"}`,
    );
  }
  const data = body.data;

  return repos.map((repo, i) => ({
    repo,
    open: data[`open${i}`]?.issueCount ?? 0,
    merged: data[`merged${i}`]?.issueCount ?? 0,
    closed: data[`closed${i}`]?.issueCount ?? 0,
    reviewed: data[`reviewed${i}`]?.issueCount ?? 0,
  }));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const org = params.get("org") ?? "";
  const login = params.get("login") ?? "";
  const rangeParam = params.get("range") ?? "90d";
  const repos = (params.get("repos") ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  if (!GITHUB_NAME.test(org)) {
    return NextResponse.json({ error: "Invalid 'org'" }, { status: 400 });
  }
  if (!GITHUB_NAME.test(login)) {
    return NextResponse.json({ error: "Invalid 'login'" }, { status: 400 });
  }
  if (!STATS_RANGES.includes(rangeParam as StatsRange)) {
    return NextResponse.json({ error: "Invalid 'range'" }, { status: 400 });
  }
  if (repos.length > MAX_REPOS || !repos.every((r) => REPO_NAME.test(r))) {
    return NextResponse.json({ error: "Invalid 'repos'" }, { status: 400 });
  }
  if (repos.length === 0) {
    return NextResponse.json([]);
  }

  const { data: token, error: tokenError } = await tryCatch(getGitHubToken());
  if (tokenError) {
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  const since = statsSinceDate(rangeParam as StatsRange);
  const chunks: string[][] = [];
  for (let i = 0; i < repos.length; i += REPOS_PER_REQUEST) {
    chunks.push(repos.slice(i, i + REPOS_PER_REQUEST));
  }

  const { data: results, error } = await tryCatch(
    Promise.all(
      chunks.map((chunk) => fetchRepoStatsChunk(chunk, login, org, since, token)),
    ),
  );
  if (error) {
    console.error("Failed to fetch member repo stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch repo stats" },
      { status: 502 },
    );
  }

  return NextResponse.json(results.flat());
}
