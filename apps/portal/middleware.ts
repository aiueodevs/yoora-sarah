import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { portalSessionCookieName, verifySessionToken } from "./lib/session-token";

function isAuthConfigured() {
  return Boolean(
    process.env.YOORA_PORTAL_AUTH_SECRET?.trim() &&
      process.env.YOORA_PORTAL_BOOTSTRAP_PASSWORD?.trim(),
  );
}

function isPublicPath(pathname: string) {
  return pathname.startsWith("/login");
}

export async function middleware(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(portalSessionCookieName)?.value;
  const payload = sessionCookie
    ? await verifySessionToken(sessionCookie, process.env.YOORA_PORTAL_AUTH_SECRET as string)
    : null;

  if (isPublicPath(pathname)) {
    if (payload) {
      const redirectUrl = request.nextUrl.clone();
      const nextPath = request.nextUrl.searchParams.get("next");
      redirectUrl.pathname = nextPath && nextPath.startsWith("/") ? nextPath : "/";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  if (!payload) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
