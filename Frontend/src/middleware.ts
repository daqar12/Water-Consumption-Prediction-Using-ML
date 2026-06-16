import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;

  // If there is no token and the user is trying to access any dashboard path, redirect to login
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Only match /dashboard and any nested subpaths under /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
