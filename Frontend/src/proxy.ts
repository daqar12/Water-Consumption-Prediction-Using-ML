import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16+ network boundary (replaces deprecated middleware.ts).
 * Protects /dashboard routes when no session cookie is present.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
