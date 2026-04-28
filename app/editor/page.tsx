"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DocTemplate = {
  id: string;
  title: string;
  subtitle: string;
  kind: "blank" | "plan" | "report";
};

type ExistingDoc = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
};

type ChatMessage = {
  id: number;
  sender: "you" | "user";
  text: string;
};

const templates: DocTemplate[] = [
  { id: "blank", title: "Blank", subtitle: "document", kind: "blank" },
  { id: "group-plan", title: "Group", subtitle: "Project Plan", kind: "plan" },
  { id: "group-report", title: "Group", subtitle: "Report", kind: "report" },
];

const existingDocs: ExistingDoc[] = [
  {
    id: "task-1",
    title: "Task 1",
    subtitle: "Plan",
    content: "Task 1\n-\n-\nTask 2:\n-\n-\n",
  },
  {
    id: "task-2",
    title: "Task 2",
    subtitle: "Plan",
    content: "Task 1:\n-\nTask 2:\n-\n-\n",
  },
  {
    id: "task-3",
    title: "Task 3",
    subtitle: "Plan",
    content: "Task 1:\n-\nTask 2:\n-\n-\n",
  },
];

const initialMessages: ChatMessage[] = [
  { id: 1, sender: "you", text: "Hey" },
  { id: 2, sender: "user", text: "Hey" },
];

function TemplateCard({
  title,
  subtitle,
  kind,
  onClick,
}: {
  title: string;
  subtitle: string;
  kind: "blank" | "plan" | "report";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-[120px] w-[90px] items-center justify-center rounded-md border-2 border-slate-900 bg-white">
        {kind === "blank" && <div className="h-[84px] w-[56px] rounded-sm border border-slate-300 bg-white" />}

        {kind === "plan" && (
          <div className="h-[86px] w-[58px] rounded-sm border border-slate-900 bg-white p-1 text-left text-[8px] leading-tight">
            <div className="font-bold">Title</div>
            <div>- Task 1:</div>
            <div>-</div>
            <div>-</div>
            <div>- Task 2:</div>
            <div>-</div>
            <div>-</div>
          </div>
        )}

        {kind === "report" && (
          <div className="h-[86px] w-[58px] rounded-sm border border-slate-900 bg-white p-1">
            <div className="text-left text-[8px] font-bold">Title</div>
            <div className="mt-1 h-5 w-full border border-slate-900" />
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full bg-slate-700" />
              <div className="h-1 w-5/6 bg-slate-700" />
              <div className="h-1 w-4/5 bg-slate-700" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-center leading-tight">
        <div className="text-[22px] font-semibold text-slate-900">{title}</div>
        <div className="text-[22px] text-slate-900">{subtitle}</div>
      </div>
    </button>
  );
}

export default function EditorPage() {
  const router = useRouter();
  const [view, setView] = useState<"picker" | "editor">("picker");
  const [docTitle, setDocTitle] = useState("Group Project");
  const [editorText, setEditorText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");

  const openTemplate = (template: DocTemplate) => {
    setView("editor");

    if (template.kind === "blank") {
      setDocTitle("Untitled Document");
      setEditorText("");
    } else if (template.kind === "plan") {
      setDocTitle("Group Project Plan");
      setEditorText("Task 1:\n-\n-\n\nTask 2:\n-\n-\n");
    } else {
      setDocTitle("Group Report");
      setEditorText("Introduction\n\n\nDiscussion\n\n\nConclusion\n");
    }
  };

  const openExistingDoc = (doc: ExistingDoc) => {
    setView("editor");
    setDocTitle(`${doc.title} ${doc.subtitle}`);
    setEditorText(doc.content);
  };

  const sendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "you",
        text: trimmed,
      },
    ]);

    setChatInput("");
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

        {/* CENTER CONTENT */}
        <section className="flex min-h-full flex-1 flex-col border border-l-0 border-white/70 bg-white/45 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {view === "picker" ? (
            <div className="h-full rounded-[28px] border-2 border-slate-900 bg-white/70 p-8">
              <h2 className="text-[54px] leading-none tracking-tight">Pick Template</h2>

              <div className="mt-10 grid grid-cols-3 gap-8 max-w-[700px]">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    title={template.title}
                    subtitle={template.subtitle}
                    kind={template.kind}
                    onClick={() => openTemplate(template)}
                  />
                ))}
              </div>

              <h3 className="mt-16 text-[48px] leading-none tracking-tight">My documents</h3>

              <div className="mt-10 grid grid-cols-3 gap-8 max-w-[700px]">
                {existingDocs.map((doc) => (
                  <TemplateCard
                    key={doc.id}
                    title={doc.title}
                    subtitle={doc.subtitle}
                    kind="plan"
                    onClick={() => openExistingDoc(doc)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full rounded-[28px] border-2 border-slate-900 bg-white/70">
              {/* top menu */}
              <div className="flex h-[58px] items-center border-b-2 border-slate-900">
                <button
                  onClick={() => setView("picker")}
                  className="flex h-full items-center border-r-2 border-slate-900 px-6 text-[28px] hover:bg-slate-100"
                >
                  ←
                </button>

                <button className="flex h-full items-center border-r-2 border-slate-900 px-6 text-[24px] hover:bg-slate-100">
                  File
                </button>

                <button className="flex h-full items-center border-r-2 border-slate-900 px-6 text-[24px] hover:bg-slate-100">
                  Edit
                </button>
              </div>

              {/* toolbar */}
              <div className="flex h-[58px] items-center border-b-2 border-slate-900">
                <button className="flex h-full w-[64px] items-center justify-center border-r-2 border-slate-900 text-[30px] hover:bg-slate-100">
                  T
                </button>
                <button className="flex h-full w-[64px] items-center justify-center border-r-2 border-slate-900 text-[26px] hover:bg-slate-100">
                  ≡
                </button>
                <button className="flex h-full w-[64px] items-center justify-center border-r-2 border-slate-900 text-[26px] hover:bg-slate-100">
                  ✎
                </button>
                <button className="flex h-full w-[64px] items-center justify-center border-r-2 border-slate-900 text-[26px] hover:bg-slate-100">
                  11
                </button>
                <button className="flex h-full w-[64px] items-center justify-center border-r-2 border-slate-900 text-[26px] hover:bg-slate-100">
                  ☰
                </button>
              </div>

              {/* editor */}
              <div className="p-8">
                <input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="mb-6 w-full border-none bg-transparent text-[54px] leading-none tracking-tight outline-none"
                />

                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder="Start writing..."
                  className="min-h-[560px] w-full resize-none border-none bg-transparent text-[24px] leading-relaxed outline-none"
                />
              </div>
            </div>
          )}
        </section>

        {/* RIGHT CHAT */}
        <aside className="flex min-h-full w-[380px] flex-col overflow-hidden rounded-r-[28px] border border-l-0 border-white/70 bg-white/55 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex h-[58px] items-center justify-between border-b border-slate-200/80 bg-white/70 px-4">
            <div className="flex items-center gap-3">
              <div className="text-[22px] font-semibold leading-none text-slate-900">
                Online Users:
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm">
                  🔵
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm">
                  🟣
                </div>
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
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
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