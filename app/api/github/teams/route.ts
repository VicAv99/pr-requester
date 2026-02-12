import { NextRequest, NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/github";

function parseLinkHeader(header: string | null): Record<string, string> {
  if (!header) return {};
  const links: Record<string, string> = {};
  for (const part of header.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) links[match[2]] = match[1];
  }
  return links;
}

export async function GET(request: NextRequest) {
  const org = request.nextUrl.searchParams.get("org");

  if (!org) {
    return NextResponse.json(
      { error: "org parameter required" },
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

  const allTeams: unknown[] = [];
  let url: string | null =
    `https://api.github.com/orgs/${encodeURIComponent(org)}/teams?per_page=100`;

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("GitHub API error:", response.status, body);
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: response.status },
      );
    }

    const teams = await response.json();
    allTeams.push(...teams);

    const links = parseLinkHeader(response.headers.get("link"));
    url = links.next ?? null;
  }

  return NextResponse.json(allTeams);
}
