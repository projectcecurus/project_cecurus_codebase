import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/run-review", "/review-session", "/analytics", "/users", "/settings", "/compliance"];
const ACCESS_COOKIE = "cecurus_access_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtected && !request.cookies.get(ACCESS_COOKIE)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/run-review/:path*", "/review-session/:path*", "/analytics/:path*", "/users/:path*", "/settings/:path*", "/compliance/:path*"],
};
