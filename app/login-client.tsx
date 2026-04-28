"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Mode = "login" | "register";

export default function LoginClient() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const u = username.trim();
    if (!u || !password) return false;
    if (mode === "register" && u.length < 3) return false;
    if (mode === "register" && password.length < 8) return false;
    return true;
  }, [mode, password, username]);

  const handleSubmit = async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          ...(mode === "register" ? { displayName } : {}),
        }),
      });

      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? "Request failed.");
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#eaf0fa_0%,#f7f9fd_45%,#eef4fd_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1100px] items-center justify-center p-6">
        <div className="w-full max-w-[520px] overflow-hidden rounded-[36px] border border-white/70 bg-white/70 shadow-[0_30px_90px_rgba(15,23,42,0.20)] backdrop-blur-xl">
          <div className="border-b border-slate-200/80 bg-white/70 px-8 py-7">
            <div className="text-[44px] leading-none tracking-tight">
              {mode === "login" ? "Sign in" : "Register"}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              {mode === "login"
                ? "Use your username and password to continue."
                : "Create an account to access the prototype."}
            </div>
          </div>

          <div className="px-8 py-7">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Register
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-sky-400"
                  placeholder="e.g. shrikha"
                />
                {mode === "register" && (
                  <div className="mt-2 text-xs text-slate-500">Minimum 3 characters.</div>
                )}
              </div>

              {mode === "register" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Display name (optional)
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="nickname"
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-sky-400"
                    placeholder="e.g. Shrikha"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSubmit();
                  }}
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-sky-400"
                  placeholder={mode === "register" ? "Minimum 8 characters" : "Your password"}
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!canSubmit || submitting}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-sky-300/40 transition disabled:opacity-60"
              >
                {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                This is a prototype authentication flow.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

