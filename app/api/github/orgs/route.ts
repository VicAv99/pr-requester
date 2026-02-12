import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/github";

export async function GET() {
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

  const response = await fetch("https://api.github.com/user/orgs?per_page=100", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("GitHub API error:", response.status, body);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: response.status },
    );
  }

  const orgs = await response.json();
  return NextResponse.json(orgs);
}
