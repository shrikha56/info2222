"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserOption = {
  name: string;
  avatar: string;
};

type TaskItem = {
  id: number;
  user: string;
  avatar: string;
  name: string;
  priority: "red" | "yellow" | "green";
  done: boolean;
  dueDate: string;
};

type ScheduleItem = {
  id: number;
  task: string;
  deadline: string;
  meeting: string;
  location: string;
};

type ReminderItem = {
  id: number;
  text: string;
  done: boolean;
};

const userOptions: UserOption[] = [
  { name: "you", avatar: "🟣" },
  { name: "user 1", avatar: "🔵" },
  { name: "user 2", avatar: "🟢" },
  { name: "user 3", avatar: "🟠" },
];

export default function TasksPage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    {
      id: 1,
      task: "Task 1",
      deadline: "Mar 2",
      meeting: "Project planning",
      location: "Feb 28 · Room 1.2",
    },
    { id: 2, task: "Task 2", deadline: "Mar 3", meeting: "Discussion", location: "Mar 1 · Online" },
    { id: 3, task: "Task 3", deadline: "Mar 4", meeting: "-", location: "-" },
    { id: 4, task: "Task 4", deadline: "Mar 5", meeting: "-", location: "-" },
  ]);

  const [taskList, setTaskList] = useState<TaskItem[]>([
    { id: 1, user: "you", avatar: "🟣", name: "Task 1", priority: "red", done: true, dueDate: "Mar 2" },
    { id: 2, user: "user 1", avatar: "🔵", name: "Task 2", priority: "yellow", done: true, dueDate: "Mar 3" },
    { id: 3, user: "user 2", avatar: "🟢", name: "Task 3", priority: "green", done: false, dueDate: "Mar 4" },
    { id: 4, user: "user 3", avatar: "🟠", name: "Task 4", priority: "green", done: true, dueDate: "Mar 5" },
  ]);

  const [reminders, setReminders] = useState<ReminderItem[]>([
    { id: 1, text: "Submit Documents", done: false },
    { id: 2, text: "Finish the interviews", done: true },
  ]);

  const [upcoming] = useState([
    { task: "Task 1 deadline", days: 2 },
    { task: "Task 2 deadline", days: 3 },
  ]);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [openAllocationId, setOpenAllocationId] = useState<number | null>(null);
  const [isReminderInputOpen, setIsReminderInputOpen] = useState(false);

  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskUser, setNewTaskUser] = useState("you");
  const [newReminderText, setNewReminderText] = useState("");

  const completedTasks = taskList.filter((task) => task.done).length;
  const completion = taskList.length === 0 ? 0 : Math.round((completedTasks / taskList.length) * 100);
  const completionDegrees = completion * 3.6;

  const priorityBorder = (priority: TaskItem["priority"]) => {
    if (priority === "red") return "border-red-400";
    if (priority === "yellow") return "border-yellow-300";
    return "border-lime-400";
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleAddTask = () => {
    const trimmedName = newTaskName.trim();
    if (!trimmedName) return;

    const selectedUser = userOptions.find((user) => user.name === newTaskUser) ?? userOptions[0];
    const formattedDate = formatDate(newTaskDate);
    const id = Date.now();

    const newTask: TaskItem = {
      id,
      user: selectedUser.name,
      avatar: selectedUser.avatar,
      name: trimmedName,
      priority: "green",
      done: false,
      dueDate: formattedDate,
    };

    const newScheduleRow: ScheduleItem = {
      id,
      task: trimmedName,
      deadline: formattedDate,
      meeting: "-",
      location: `Assigned to ${selectedUser.name}`,
    };

    setTaskList((prev) => [newTask, ...prev]);
    setSchedule((prev) => [newScheduleRow, ...prev]);

    setNewTaskName("");
    setNewTaskDate("");
    setNewTaskUser("you");
    setIsAddTaskOpen(false);
  };

  const handleChangeAllocation = (taskId: number, selectedUser: UserOption) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              user: selectedUser.name,
              avatar: selectedUser.avatar,
            }
          : task
      )
    );
    setOpenAllocationId(null);
  };

  const handleAddReminder = () => {
    const trimmed = newReminderText.trim();
    if (!trimmed) return;

    setReminders((prev) => [
      {
        id: Date.now(),
        text: trimmed,
        done: false,
      },
      ...prev,
    ]);

    setNewReminderText("");
    setIsReminderInputOpen(false);
  };

  const toggleReminder = (id: number) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, done: !reminder.done } : reminder
      )
    );
  };

  const toggleTaskDone = (id: number) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

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
              className="mt-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-xl font-bold text-rose-700 shadow-sm transition hover:scale-[1.03]"
              title="Logout"
              aria-label="Logout"
            >
              ⎋
            </button>

            <div className="mt-4 text-2xl tracking-[6px] text-sky-500">...</div>
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

        <section className="grid flex-1 grid-cols-12 gap-4 rounded-r-[28px] border border-l-0 border-white/70 bg-white/50 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="col-span-8">
            <div className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[36px] leading-none tracking-tight">Schedule</div>
                  <div className="mt-1 text-sm text-slate-500">Your weekly planning overview</div>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-300/40 transition hover:scale-[1.02]"
                >
                  Add Task
                </button>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50/90">
                    <tr className="text-[17px] text-slate-700">
                      <th className="border-b border-r border-slate-200 px-3 py-3">Task</th>
                      <th className="border-b border-r border-slate-200 px-3 py-3">Deadline</th>
                      <th className="border-b border-r border-slate-200 px-3 py-3">Meeting Date</th>
                      <th className="border-b border-slate-200 px-3 py-3">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr key={item.id} className="transition hover:bg-sky-50/50">
                        <td className="border-r border-t border-slate-200 px-3 py-3 font-medium text-sky-700">
                          {item.task}
                        </td>
                        <td className="border-r border-t border-slate-200 px-3 py-3">{item.deadline}</td>
                        <td className="border-r border-t border-slate-200 px-3 py-3">{item.meeting}</td>
                        <td className="border-t border-slate-200 px-3 py-3">{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[30px] leading-none tracking-tight">Reminders</h2>
                  <button
                    onClick={() => setIsReminderInputOpen((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-sky-600 shadow-sm"
                  >
                    Add
                  </button>
                </div>

                {isReminderInputOpen && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-md">
                    <div className="mb-2 text-sm font-medium text-slate-500">New reminder here</div>
                    <div className="flex gap-2">
                      <input
                        value={newReminderText}
                        onChange={(e) => setNewReminderText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReminder();
                        }}
                        placeholder="Type reminder..."
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-400"
                      />
                      <button
                        onClick={handleAddReminder}
                        className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-base">
                  {reminders.map((reminder) => (
                    <label
                      key={reminder.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={reminder.done}
                        onChange={() => toggleReminder(reminder.id)}
                        className="h-5 w-5 accent-sky-500"
                      />
                      <span className={reminder.done ? "text-sky-700 line-through" : "text-slate-800"}>
                        {reminder.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="mb-3">
                  <h2 className="text-[28px] leading-none tracking-tight">Upcoming</h2>
                  <div className="mt-1 text-sm text-slate-500">Deadlines in the next few days</div>
                </div>

                <div className="space-y-3 text-[15px]">
                  {upcoming.map((item) => (
                    <div
                      key={item.task}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3"
                    >
                      <span className="text-sky-700">{item.task}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                        {item.days}d
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-800">Completion</div>
                    <div className="text-sm text-slate-500">Current team progress</div>
                  </div>

                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(
                          from 270deg,
                          #06b6d4 0deg,
                          #22c55e ${completionDegrees * 0.55}deg,
                          #8b5cf6 ${completionDegrees}deg,
                          rgba(148,163,184,0.18) ${completionDegrees}deg,
                          rgba(148,163,184,0.18) 360deg
                        )`,
                      }}
                    />
                    <div className="absolute inset-[12px] rounded-full bg-white/95 shadow-inner" />
                    <div className="relative z-10 text-center">
                      <div className="text-3xl font-bold text-slate-900">{completion}%</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Done</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="col-span-4">
            <div className="overflow-visible rounded-[28px] border border-white/80 bg-white/75 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="grid grid-cols-[110px_1fr_64px_92px] border-b border-slate-200 bg-white/85">
                <div className="border-r border-slate-200 px-2 py-3 text-center text-[18px] font-semibold leading-tight text-slate-700">
                  Allocated
                  <br />
                  to
                </div>
                <div className="border-r border-slate-200 px-4 py-3 text-[34px] leading-none tracking-tight">
                  Task List
                </div>
                <div className="border-r border-slate-200 px-2 py-3" />
                <div className="flex items-center justify-center px-2 py-3">
                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-md"
                  >
                    Add
                  </button>
                </div>
              </div>

              {taskList.map((task) => (
                <div
                  key={task.id}
                  className="relative grid grid-cols-[110px_1fr_64px_92px] border-b border-slate-200 last:border-b-0"
                >
                  <button
                    onClick={() =>
                      setOpenAllocationId((prev) => (prev === task.id ? null : task.id))
                    }
                    className="relative flex flex-col items-center justify-center border-r border-slate-200 py-3 transition hover:bg-sky-50/70"
                  >
                    <div className="mb-1 text-[18px] leading-none text-slate-700">{task.user}</div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl shadow-sm">
                      {task.avatar}
                    </div>

                    {openAllocationId === task.id && (
                      <div className="absolute left-[84px] top-1/2 z-30 w-[190px] -translate-y-1/2 rounded-[24px] border border-slate-200 bg-white p-3 text-left shadow-2xl">
                        <div className="mb-3 text-sm font-semibold text-sky-700">
                          Change Allocation
                        </div>
                        <div className="space-y-2">
                          {userOptions.map((option) => (
                            <button
                              key={option.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangeAllocation(task.id, option);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-sky-50"
                            >
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-xl">
                                {option.avatar}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{option.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>

                  <div className="flex items-center border-r border-slate-200 px-4 py-4 text-[24px] font-medium text-sky-700">
                    {task.name}
                  </div>

                  <div className="flex items-center justify-center border-r border-slate-200">
                    <div className={`h-7 w-7 rounded-md border-[3px] ${priorityBorder(task.priority)}`} />
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => toggleTaskDone(task.id)}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border-[3px] border-slate-900 bg-white text-3xl text-lime-500 shadow-sm"
                    >
                      {task.done ? "✓" : ""}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>

      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-[42px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.25)] backdrop-blur-xl">
            <div className="mb-8 text-center text-[54px] leading-none tracking-tight text-slate-900">
              Add Task
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[22px] font-medium text-slate-800">
                  Name of Task
                </label>
                <input
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Enter task name"
                  className="w-full rounded-[22px] border border-slate-300 bg-white px-5 py-4 text-lg outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-[22px] font-medium text-slate-800">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full rounded-[22px] border border-slate-300 bg-white px-5 py-4 text-lg outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-3 block text-[22px] font-medium text-slate-800">
                  Allocate Task
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {userOptions.map((user) => (
                    <button
                      key={user.name}
                      onClick={() => setNewTaskUser(user.name)}
                      className={`flex items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition ${
                        newTaskUser === user.name
                          ? "border-sky-400 bg-sky-50 shadow-md"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl">
                        {user.avatar}
                      </div>
                      <div className="font-medium text-slate-800">{user.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-300/40"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

