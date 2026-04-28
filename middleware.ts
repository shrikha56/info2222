import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionTokenEdge } from "@/lib/session-edge";

const PUBLIC_PATHS = new Set(["/"]);

const isStaticOrInternalPath = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/api/auth") ||
  pathname === "/favicon.ico" ||
  pathname === "/robots.txt" ||
  pathname === "/sitemap.xml";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticOrInternalPath(pathname) || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySessionTokenEdge(token) : null;

  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
