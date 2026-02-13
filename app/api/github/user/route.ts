import { NextResponse } from "next/server";
import { getGitHubToken } from "@/lib/github";
import { tryCatch } from "@/utils/try-catch";

export async function GET() {
  const { data: token, error: tokenError } = await tryCatch(getGitHubToken());
  if (tokenError) {
    console.error("Failed to get GitHub token:", tokenError);
    return NextResponse.json(
      { error: "Failed to authenticate with GitHub" },
      { status: 401 },
    );
  }

  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("GitHub API error:", response.status, body);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: response.status },
    );
  }

  const user = await response.json();
  return NextResponse.json({
    login: user.login,
    avatar_url: user.avatar_url,
    name: user.name,
  });
}
