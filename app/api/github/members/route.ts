import { NextRequest, NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";

const PER_PAGE = 100;
const MAX_PAGES = 10;

export async function GET(request: NextRequest) {
  const org = request.nextUrl.searchParams.get("org");
  const team = request.nextUrl.searchParams.get("team");

  if (!org || !team) {
    return NextResponse.json(
      { error: "org and team parameters required" },
      { status: 400 },
    );
  }

  const { data: token, error: tokenError } = await tryCatch(getGitHubToken());
  if (tokenError) {
    console.error("Failed to get GitHub token:", tokenError);
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  // Follow pagination so teams over 100 members aren't silently cut off
  const members: { login: string; avatar_url: string }[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(
      `https://api.github.com/orgs/${encodeURIComponent(org)}/teams/${encodeURIComponent(team)}/members?per_page=${PER_PAGE}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("GitHub API error:", response.status, body);
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: response.status },
      );
    }

    const batch: { login: string; avatar_url: string }[] = await response.json();
    members.push(...batch.map((m) => ({ login: m.login, avatar_url: m.avatar_url })));
    if (batch.length < PER_PAGE) break;
  }

  return NextResponse.json(members);
}
