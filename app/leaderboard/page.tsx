import Link from "next/link";

const topThree = [
  {
    rank: 1,
    name: "user",
    avatar: "🟣",
    messages: 3000,
    accent: "from-yellow-300 via-yellow-400 to-amber-500",
    shadow: "shadow-yellow-300/40",
    text: "text-amber-700",
  },
  {
    rank: 2,
    name: "user1",
    avatar: "🔵",
    messages: 2900,
    accent: "from-slate-200 via-slate-300 to-slate-400",
    shadow: "shadow-slate-300/40",
    text: "text-slate-100",
  },
  {
    rank: 3,
    name: "user2",
    avatar: "🟢",
    messages: 1000,
    accent: "from-orange-400 via-orange-500 to-amber-700",
    shadow: "shadow-orange-300/30",
    text: "text-white",
  },
];

const leaderboardRows = [
  { no: 1, user: "user1", messages: 3000, tasks: 3, accolade: "Highest Contributor" },
  { no: 2, user: "user2", messages: 2900, tasks: 3, accolade: "Runner Up" },
  { no: 3, user: "user3", messages: 1000, tasks: 2, accolade: "" },
  { no: 4, user: "user4", messages: 500, tasks: 2, accolade: "" },
  { no: 5, user: "user5", messages: 450, tasks: 2, accolade: "" },
  { no: 6, user: "user6", messages: 30, tasks: 2, accolade: "" },
];

function TrophyCard({
  rank,
  name,
  avatar,
  messages,
  accent,
  shadow,
  text,
}: {
  rank: number;
  name: string;
  avatar: string;
  messages: number;
  accent: string;
  shadow: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex h-[240px] w-[180px] items-center justify-center rounded-[48px] bg-gradient-to-b ${accent} ${shadow} shadow-2xl`}
      >
        <div className="absolute top-4 h-8 w-28 rounded-full bg-white/70" />
        <div className={`absolute top-10 text-6xl font-bold ${text}`}>#{rank}</div>

        <div className="absolute left-[-18px] top-24 h-16 w-10 rounded-l-full border-l-[10px] border-white/40" />
        <div className="absolute right-[-18px] top-24 h-16 w-10 rounded-r-full border-r-[10px] border-white/40" />

        <div className="absolute bottom-[-18px] flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-5xl shadow-lg">
          {avatar}
        </div>
      </div>

      <div className="mt-8 text-center leading-tight">
        <div className="text-4xl font-semibold tracking-tight text-slate-900">{name}</div>
        <div className="text-3xl font-medium text-slate-800">{messages}</div>
        <div className="text-3xl font-medium text-slate-800">Messages</div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#eaf0fa_0%,#f7f9fd_45%,#eef4fd_100%)] text-slate-900">
      <div className="mx-auto flex max-w-[1500px] gap-0 p-5">
        {/* LEFT SIDEBAR */}
        <aside className="flex w-[235px] shrink-0 overflow-hidden rounded-l-[28px] border border-white/70 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex w-[70px] flex-col items-center border-r border-slate-200/80 bg-white/50">
            <div className="flex h-[58px] w-full items-center justify-center border-b border-slate-200/80 text-3xl text-sky-700">
              ☰
            </div>

            <Link
        href="/"
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
        href="/"
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

            <div className="mt-5 text-2xl tracking-[6px] text-sky-500">...</div>
          </div>

          <div className="flex-1">
            <div className="flex h-[58px] items-center border-b border-slate-200/80 px-4">
              <h1 className="text-[42px] leading-none tracking-tight">Tasks</h1>
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

        {/* MAIN */}
        <section className="flex-1 rounded-r-[28px] border border-l-0 border-white/70 bg-white/50 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-[52px] leading-none tracking-tight">Leaderboard</h2>
              <p className="mt-2 text-base text-slate-500">
                Top contributors ranked by activity and completed work
              </p>
            </div>

            <Link
              href="/"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:scale-[1.02]"
            >
              Back to Tasks
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {topThree.map((user) => (
              <div key={user.rank} className="rounded-[30px] border border-white/70 bg-white/70 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <TrophyCard {...user} />
              </div>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50/90">
                <tr className="text-[20px] text-slate-800">
                  <th className="border-b border-r border-slate-200 px-4 py-4">No</th>
                  <th className="border-b border-r border-slate-200 px-4 py-4">User</th>
                  <th className="border-b border-r border-slate-200 px-4 py-4">Messages</th>
                  <th className="border-b border-r border-slate-200 px-4 py-4">Tasks accomplished</th>
                  <th className="border-b border-slate-200 px-4 py-4">Accolades</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardRows.map((row) => (
                  <tr key={row.no} className="transition hover:bg-sky-50/40">
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-lg">{row.no}</td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-2xl font-medium text-sky-700">
                      {row.user}
                    </td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-3xl font-medium text-sky-700">
                      {row.messages}
                    </td>
                    <td className="border-r border-t border-slate-200 px-4 py-4 text-3xl font-medium text-sky-700">
                      {row.tasks}
                    </td>
                    <td className="border-t border-slate-200 px-4 py-4 text-2xl font-medium text-sky-700">
                      {row.accolade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}