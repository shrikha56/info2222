import { NextResponse } from "next/server";
import { getUserByUsername, getPublicUserById } from "@/lib/auth-store";
import { createSessionToken, sessionMaxAgeSeconds, verifyPassword } from "@/lib/security";

const SESSION_COOKIE = "session";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const user = getUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = createSessionToken(user.id);
  const publicUser = getPublicUserById(user.id);
  const response = NextResponse.json({ user: publicUser });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
  return response;
}
