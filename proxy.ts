import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const pat = request.cookies.get("github-pat")?.value;
  const user = request.cookies.get("github-user")?.value;

  if (!pat || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
