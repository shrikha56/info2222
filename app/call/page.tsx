"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ChatMessage = {
  id: number;
  sender: "you" | "user";
  text: string;
};

const onlineUsers = [
  { name: "user", avatar: "🔵" },
  { name: "you", avatar: "🟣" },
];

const initialMessages: ChatMessage[] = [
  { id: 1, sender: "you", text: "Hey" },
  { id: 2, sender: "user", text: "Hey" },
];

export default function CallPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "you",
        text: trimmed,
      },
    ]);
    setInput("");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#eaf0fa_0%,#f7f9fd_45%,#eef4fd_100%)] text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1500px] gap-0 p-5">
        {/* LEFT SIDEBAR */}
        <aside className="flex min-h-full w-[235px] shrink-0 overflow-hidden rounded-l-[28px] border border-white/70 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex w-[70px] flex-col items-center border-r border-slate-200/80 bg-white/50">
            <div className="flex h-[58px] w-full items-center justify-center border-b border-slate-200/80 text-3xl text-sky-700">
              ☰
            </div>

            <Link
              href="/tasks"
              className="mt-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition hover:scale-[1.03]"
            >
              ⌂
            </Link>

      <Link
              href="/kanban"
              className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-sm transition hover:scale-[1.03]"
            >
              KB
            </Link>
      <Link
            href="/messages"
            className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition hover:scale-[1.03]"
          >
            💬
      </Link>

      <Link
        href="/leaderboard"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:scale-[1.03]"
      >
        🏆
      </Link>

            <Link
              href="/tasks"
              className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-sm transition hover:scale-[1.03]"
            >
              Tasks
            </Link>
      <Link
        href="/call"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:scale-[1.03]"
      >
        📞
      </Link>

      <Link
        href="/editor"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:scale-[1.03]"
      >
        📝
      </Link>

      <Link
        href="/projects"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm transition hover:scale-[1.03]"
      >
        📁
      </Link>

            <button
              onClick={() => void logout()}
              className="mt-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-700 shadow-sm transition hover:scale-[1.03]"
              title="Logout"
            >
              OUT
            </button>

            <div className="mt-4 text-2xl tracking-[6px] text-sky-500">...</div>
          </div>

          <div className="flex-1">
            <div className="flex h-[58px] items-center border-b border-slate-200/80 px-4">
              <h1 className="text-[42px] leading-none tracking-tight">Groups</h1>
            </div>

            <div className="px-4 py-5 text-[24px] font-semibold leading-tight">
              <div className="mb-4 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-3 shadow-sm">
                INFO2222
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-3 shadow-sm">
                COMP2017
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER VIDEO AREA */}
        <section className="flex min-h-full flex-1 flex-col border border-l-0 border-white/70 bg-white/45 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="relative flex-1 overflow-hidden rounded-[24px] border-2 border-sky-400/70 bg-[linear-gradient(180deg,#e9eef7_0%,#dde6f5_100%)]">
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="mb-10 flex h-[70%] w-[68%] items-center justify-center rounded-t-[160px] rounded-b-[50px] bg-purple-800 shadow-[0_20px_60px_rgba(88,28,135,0.35)]">
                <div className="absolute top-[18%] h-40 w-40 rounded-full bg-purple-800" />
              </div>
            </div>
          </div>

          {/* CALL CONTROLS */}
          <div className="mt-0 grid h-[84px] grid-cols-[1fr_92px_92px_92px_1fr] overflow-hidden border-x-2 border-b-2 border-sky-400/70 bg-[#dfe5f2]">
            <div />

            <button
              onClick={() => setMicOn((prev) => !prev)}
              className={`flex items-center justify-center border-l-2 border-sky-400/70 text-4xl transition ${
                micOn ? "bg-white text-sky-700" : "bg-slate-200 text-slate-500"
              }`}
              title="Toggle microphone"
            >
              🎤
            </button>

            <button
              onClick={() => setCameraOn((prev) => !prev)}
              className={`flex items-center justify-center border-l-2 border-sky-400/70 text-4xl transition ${
                cameraOn ? "bg-white text-sky-700" : "bg-slate-200 text-slate-500"
              }`}
              title="Toggle camera"
            >
              📹
            </button>

            <button
              className="flex items-center justify-center border-l-2 border-r-2 border-sky-400/70 bg-red-500 text-4xl text-white transition hover:bg-red-600"
              title="End call"
            >
              ☎
            </button>

            <div />
          </div>
        </section>

        {/* RIGHT CHAT PANEL */}
        <aside className="flex min-h-full w-[380px] flex-col overflow-hidden rounded-r-[28px] border border-l-0 border-white/70 bg-white/55 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex h-[58px] items-center justify-between border-b border-slate-200/80 bg-white/70 px-4">
            <div className="flex items-center gap-3">
              <div className="text-[22px] font-semibold leading-none text-slate-900">
                Online Users:
              </div>
              <div className="flex items-center gap-2">
                {onlineUsers.map((user) => (
                  <div
                    key={user.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm"
                  >
                    {user.avatar}
                  </div>
                ))}
              </div>
            </div>

            <button className="text-3xl leading-none text-slate-900">×</button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-8">
              {messages.map((message) => {
                const isYou = message.sender === "you";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isYou ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[260px] items-end gap-3 ${
                        isYou ? "flex-row-reverse text-right" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-1 text-lg font-semibold text-slate-800">
                          {message.sender}
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-3xl shadow-sm">
                          {isYou ? "🟣" : "🔵"}
                        </div>
                      </div>

                      <div className="text-[24px] leading-tight text-slate-900">
                        {message.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200/80 bg-white/70 px-4 py-4">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Message"
                className="h-14 flex-1 rounded-full border-2 border-slate-900 bg-white px-5 text-[22px] outline-none placeholder:text-slate-500"
              />

              <button
                onClick={sendMessage}
                className="h-14 rounded-full border-2 border-slate-900 bg-white px-6 text-[22px] font-semibold shadow-sm transition hover:scale-[1.02]"
              >
                Send
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}