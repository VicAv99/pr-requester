import { NextResponse, type NextRequest } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";
import {
  STATS_RANGES,
  type MemberRepoActivity,
  type MemberRepos,
  type StatsRange,
} from "@/features/dashboard/types/member-stats";
import {
  buildRepoBreakdownSearch,
  statsSinceDate,
} from "@/features/dashboard/utils/member-stats-search";

const GITHUB_NAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})(?:\[bot\])?$/;
const MAX_MEMBERS = 50;
// 2 searches x 100 nodes per member; keep each GraphQL request modest
const MEMBERS_PER_REQUEST = 5;
const SAMPLE_SIZE = 100;

type SearchResult = {
  issueCount: number;
  nodes: ({ repository?: { name: string } } | null)[];
};

type GraphQLResponse = {
  data?: Record<string, SearchResult>;
  errors?: { message: string }[];
};

function tally(result: SearchResult | undefined): Map<string, number> {
  const counts = new Map<string, number>();
  for (const node of result?.nodes ?? []) {
    const name = node?.repository?.name;
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
}

async function fetchReposChunk(
  logins: string[],
  org: string,
  since: string | null,
  token: string,
): Promise<MemberRepos[]> {
  const variables: Record<string, string> = {};
  const declarations: string[] = [];
  const fields: string[] = [];

  logins.forEach((login, i) => {
    for (const kind of ["authored", "reviewed"] as const) {
      const name = `${kind}${i}`;
      variables[name] = buildRepoBreakdownSearch(kind, login, org, since);
      declarations.push(`$${name}: String!`);
      fields.push(
        `${name}: search(type: ISSUE, query: $${name}, first: ${SAMPLE_SIZE}) { issueCount nodes { ... on PullRequest { repository { name } } } }`,
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

  return logins.map((login, i) => {
    const authored = data[`authored${i}`];
    const reviewed = data[`reviewed${i}`];
    const authoredCounts = tally(authored);
    const reviewedCounts = tally(reviewed);

    const names = new Set([...authoredCounts.keys(), ...reviewedCounts.keys()]);
    const repos: MemberRepoActivity[] = [...names]
      .map((name) => ({
        name,
        authored: authoredCounts.get(name) ?? 0,
        reviewed: reviewedCounts.get(name) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.authored + b.reviewed - (a.authored + a.reviewed) ||
          a.name.localeCompare(b.name),
      );

    return {
      login,
      repos,
      truncated:
        (authored?.issueCount ?? 0) > SAMPLE_SIZE ||
        (reviewed?.issueCount ?? 0) > SAMPLE_SIZE,
    };
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const org = params.get("org") ?? "";
  const rangeParam = params.get("range") ?? "90d";
  const logins = (params.get("members") ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (!GITHUB_NAME.test(org)) {
    return NextResponse.json({ error: "Invalid 'org'" }, { status: 400 });
  }
  if (!STATS_RANGES.includes(rangeParam as StatsRange)) {
    return NextResponse.json({ error: "Invalid 'range'" }, { status: 400 });
  }
  if (logins.length > MAX_MEMBERS || !logins.every((l) => GITHUB_NAME.test(l))) {
    return NextResponse.json({ error: "Invalid 'members'" }, { status: 400 });
  }
  if (logins.length === 0) {
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
  for (let i = 0; i < logins.length; i += MEMBERS_PER_REQUEST) {
    chunks.push(logins.slice(i, i + MEMBERS_PER_REQUEST));
  }

  const { data: results, error } = await tryCatch(
    Promise.all(chunks.map((chunk) => fetchReposChunk(chunk, org, since, token))),
  );
  if (error) {
    console.error("Failed to fetch member repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch member repos" },
      { status: 502 },
    );
  }

  return NextResponse.json(results.flat());
}
