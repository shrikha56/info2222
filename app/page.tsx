import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";
import { verifySessionToken } from "@/lib/security";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? verifySessionToken(token) : null;
  if (session) {
    redirect("/tasks");
  }

  return <LoginClient />;
}