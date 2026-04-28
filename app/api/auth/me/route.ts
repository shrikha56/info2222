import { NextResponse } from "next/server";
import { getPublicUserById } from "@/lib/auth-store";
import { verifySessionToken } from "@/lib/security";

const SESSION_COOKIE = "session";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const token = decodeURIComponent(sessionCookie.split("=")[1] ?? "");
  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = getPublicUserById(payload.sub);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
