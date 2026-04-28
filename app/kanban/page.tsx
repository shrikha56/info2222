"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const columns = [
  {
    title: "Backlog",
    tasks: [
      { title: "Task 3", subtitle: "Assigned to user" },
      { title: "• • •" },
    ],
  },
  {
    title: "Next",
    tasks: [{ title: "Task" }, { title: "• • •" }],
  },
  {
    title: "In-Progress",
    tasks: [{ title: "Task 3" }, { title: "• • •" }],
  },
  {
    title: "Testing",
    tasks: [{ title: "Task 2" }, { title: "• • •" }],
  },
  {
    title: "Done",
    tasks: [{ title: "Task 1" }, { title: "• • •" }],
  },
];

const assignedTasks = [
  { member: "User", task: "Task 2" },
  { member: "You", task: "Task 3" },
  { member: "user1", task: "" },
];

const finishedTasks = [
  { task: "Task 1", finishedBy: "user" },
  { task: "..." , finishedBy: "..." },
  { task: "..." , finishedBy: "..." },
  { task: "..." , finishedBy: "..." },
];

export default function KanbanPage() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#eaf0fa_0%,#f7f9fd_45%,#eef4fd_100%)] text-slate-900">
      <div className="mx-auto flex max-w-[1500px] gap-0 p-5">
        <aside className="flex w-[235px] shrink-0 overflow-hidden rounded-l-[28px] border border-white/70 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
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

        <section className="flex-1 rounded-r-[28px] border border-l-0 border-white/70 bg-white/50 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-[52px] leading-none tracking-tight">Kanban Board</h2>
              <p className="mt-2 text-base text-slate-500">
                Track tasks across each stage of work
              </p>
            </div>

            <Link
              href="/tasks"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:scale-[1.02]"
            >
              Back to Tasks
            </Link>
          </div>

          <div className="rounded-[40px] border border-white/80 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <div className="grid grid-cols-5 overflow-hidden rounded-[30px] border border-slate-200">
              {columns.map((column, index) => (
                <div
                  key={column.title}
                  className={`${index !== columns.length - 1 ? "border-r border-slate-200" : ""} min-h-[460px] bg-white/90`}
                >
                  <div className="border-b border-slate-200 px-4 py-4 text-[20px] font-semibold text-sky-700">
                    {column.title}
                  </div>

                  <div className="space-y-4 p-4">
                    {column.tasks.map((task, taskIndex) => (
                      <div
                        key={`${column.title}-${taskIndex}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-sm"
                      >
                        <div className="text-[18px] font-medium text-slate-800">
                          {task.title}
                        </div>
                        {task.subtitle && (
                          <div className="mt-1 text-sm text-slate-500">{task.subtitle}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="col-span-2 overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 px-4 py-3 text-[22px] font-semibold text-sky-700">
                Group Members Assigned Tasks
              </div>

              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="border-b border-r border-slate-200 px-4 py-3">Member</th>
                    <th className="border-b border-slate-200 px-4 py-3">Assigned tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTasks.map((row, index) => (
                    <tr key={index}>
                      <td className="border-r border-t border-slate-200 px-4 py-4 text-[18px] font-medium text-slate-800">
                        {row.member}
                      </td>
                      <td className="border-t border-slate-200 px-4 py-4 text-[18px] text-sky-700">
                        {row.task}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="border-b border-slate-200 px-4 py-3 text-[22px] font-semibold text-sky-700">
                Finished Tasks
              </div>

              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="border-b border-r border-slate-200 px-4 py-3">Task</th>
                    <th className="border-b border-slate-200 px-4 py-3">Finished by</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedTasks.map((row, index) => (
                    <tr key={index}>
                      <td className="border-r border-t border-slate-200 px-4 py-4 text-[18px] text-sky-700">
                        {row.task}
                      </td>
                      <td className="border-t border-slate-200 px-4 py-4 text-[18px] text-slate-800">
                        {row.finishedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}