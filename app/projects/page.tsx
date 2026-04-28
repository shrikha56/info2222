"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ProjectRow = {
  id: number;
  name: string;
  author: string;
  label: string;
  docType: string;
  date: string;
};

const projectRows: ProjectRow[] = [
  {
    id: 1,
    name: "Info2222 Project Plan",
    author: "you",
    label: "Plan",
    docType: "doc",
    date: "21/03/26",
  },
  {
    id: 2,
    name: "Project Photos",
    author: "user",
    label: "Photos",
    docType: "JPG",
    date: "21/03/26",
  },
  {
    id: 3,
    name: "Kanban Notes",
    author: "user2",
    label: "Task",
    docType: "doc",
    date: "20/03/26",
  },
  {
    id: 4,
    name: "Interview Summary",
    author: "you",
    label: "Research",
    docType: "PDF",
    date: "19/03/26",
  },
  {
    id: 5,
    name: "Prototype Assets",
    author: "user3",
    label: "Design",
    docType: "ZIP",
    date: "18/03/26",
  },
  {
    id: 6,
    name: "Demo Script",
    author: "you",
    label: "Presentation",
    docType: "doc",
    date: "18/03/26",
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = ["All", "Plan", "Photos", "Task", "Research", "Design", "Presentation"];

  const filteredRows = useMemo(() => {
    return projectRows.filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.author.toLowerCase().includes(search.toLowerCase()) ||
        row.label.toLowerCase().includes(search.toLowerCase()) ||
        row.docType.toLowerCase().includes(search.toLowerCase());

      const matchesTag = activeTag === "All" || row.label === activeTag;

      return matchesSearch && matchesTag;
    });
  }, [search, activeTag]);

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

        {/* MAIN CONTENT */}
        <section className="flex min-h-full flex-1 flex-col rounded-r-[28px] border border-l-0 border-white/70 bg-white/50 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {/* TOP SEARCH BAR */}
          <div className="mb-4 flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-14 flex-1 rounded-full border-2 border-slate-900 bg-white px-6 text-[22px] outline-none placeholder:text-slate-500"
            />

            <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-2xl shadow-sm">
              🔎
            </button>

            <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-xl shadow-sm">
              🏷️
            </button>
          </div>

          {/* TAG FILTERS */}
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeTag === tag
                    ? "border-sky-300 bg-sky-100 text-sky-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-hidden rounded-[28px] border-2 border-slate-900 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-white text-[20px] text-slate-900">
                  <th className="w-[80px] border-b-2 border-r-2 border-slate-900 px-4 py-4">
                    No
                  </th>
                  <th className="border-b-2 border-r-2 border-slate-900 px-4 py-4">
                    Name
                  </th>
                  <th className="w-[140px] border-b-2 border-r-2 border-slate-900 px-4 py-4">
                    Author
                  </th>
                  <th className="w-[120px] border-b-2 border-r-2 border-slate-900 px-4 py-4">
                    Label
                  </th>
                  <th className="w-[140px] border-b-2 border-r-2 border-slate-900 px-4 py-4">
                    doc type
                  </th>
                  <th className="w-[140px] border-b-2 border-slate-900 px-4 py-4">
                    date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-sky-50/40">
                    <td className="border-r-2 border-t-2 border-slate-900 px-4 py-4 text-[20px]">
                      {row.id}
                    </td>
                    <td className="border-r-2 border-t-2 border-slate-900 px-4 py-4 text-[22px] font-medium">
                      {row.name}
                    </td>
                    <td className="border-r-2 border-t-2 border-slate-900 px-4 py-4 text-[22px]">
                      {row.author}
                    </td>
                    <td className="border-r-2 border-t-2 border-slate-900 px-4 py-4 text-[22px] text-sky-700">
                      {row.label}
                    </td>
                    <td className="border-r-2 border-t-2 border-slate-900 px-4 py-4 text-[22px]">
                      {row.docType}
                    </td>
                    <td className="border-t-2 border-slate-900 px-4 py-4 text-[22px]">
                      {row.date}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="border-t-2 border-slate-900 px-4 py-10 text-center text-lg text-slate-500"
                    >
                      No matching project files found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}