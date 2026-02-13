import { NextRequest, NextResponse } from "next/server";

const PAT_COOKIE = "github-pat";
const USER_COOKIE = "github-user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 },
    );
  }

  const ghResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!ghResponse.ok) {
    return NextResponse.json(
      { error: "Invalid GitHub Personal Access Token" },
      { status: 401 },
    );
  }

  const ghUser = await ghResponse.json();
  const user = {
    login: ghUser.login,
    name: ghUser.name || ghUser.login,
    avatar_url: ghUser.avatar_url,
  };

  const response = NextResponse.json({ success: true, user });

  response.cookies.set(PAT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  response.cookies.set(USER_COOKIE, JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

export async function GET() {
  return NextResponse.json({ hasToken: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(PAT_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(USER_COOKIE, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
