import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/analyze", "/history", "/analysis"];

export function proxy(request: NextRequest) {
  const session = request.cookies.get("cryptosafe_session")?.value;
  const path = request.nextUrl.pathname;

  const needsAuth = protectedPaths.some((prefix) => path.startsWith(prefix));
  if (needsAuth && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((path === "/login" || path === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analyze/:path*", "/history/:path*", "/analysis/:path*", "/login", "/register"],
};
