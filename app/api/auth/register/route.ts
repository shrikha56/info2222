import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth-store";
import { createSessionToken, hashPassword, sessionMaxAgeSeconds } from "@/lib/security";

const SESSION_COOKIE = "session";

type RegisterBody = {
  username?: string;
  password?: string;
  displayName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const usernameRaw = body.username?.trim();
  const password = body.password ?? "";

  if (!usernameRaw || usernameRaw.length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters long." },
      { status: 400 }
    );
  }

  const username = usernameRaw.toLowerCase();
  const displayName = body.displayName?.trim() || username;

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ username, passwordHash, displayName });
  if (!user) {
    return NextResponse.json({ error: "Username already exists." }, { status: 409 });
  }

  const token = createSessionToken(user.id);
  const response = NextResponse.json({ user }, { status: 201 });
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
