import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Public paths that do NOT require auth
const PUBLIC_PATHS = ["/login", "/api/auth", "/", "/_next", "/favicon"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const isAuthenticated = !!req.auth?.user;

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
