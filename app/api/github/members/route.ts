import { NextRequest, NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/github";

export async function GET(request: NextRequest) {
  const org = request.nextUrl.searchParams.get("org");
  const team = request.nextUrl.searchParams.get("team");

  if (!org || !team) {
    return NextResponse.json(
      { error: "org and team parameters required" },
      { status: 400 },
    );
  }

  let token: string;
  try {
    token = await getGitHubToken();
  } catch (error) {
    console.error("Failed to get GitHub token:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  const response = await fetch(
    `https://api.github.com/orgs/${encodeURIComponent(org)}/teams/${encodeURIComponent(team)}/members?per_page=100`,
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

  const members = await response.json();
  return NextResponse.json(members);
}
