import { useEffect, useMemo, useReducer, useRef, useState } from "react";

const DAY_MS = 1000 * 60 * 60 * 24;

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function toISODate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateValue));
}

function formatDateTime(dateValue) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function formatDuration(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function daysRemaining(dateValue) {
  return Math.max(0, Math.ceil((new Date(dateValue).getTime() - Date.now()) / DAY_MS));
}

function initials(name) {
  return name
    .split(" ")
    .map((piece) => piece[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function createMockSvg(label, from, to) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="36" fill="url(#g)" />
      <circle cx="650" cy="130" r="100" fill="rgba(255,255,255,0.10)" />
      <circle cx="130" cy="500" r="120" fill="rgba(255,255,255,0.08)" />
      <rect x="80" y="90" width="260" height="18" rx="9" fill="rgba(255,255,255,0.35)" />
      <rect x="80" y="132" width="160" height="12" rx="6" fill="rgba(255,255,255,0.25)" />
      <rect x="80" y="210" width="640" height="260" rx="28" fill="rgba(15,23,42,0.35)" stroke="rgba(255,255,255,0.18)" />
      <text x="80" y="560" font-size="42" font-family="Space Mono, monospace" fill="white">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const projectDueDate = addDays(new Date(), 18);

const teamMembers = [
  { id: "alex", name: "Alex T.", role: "Project Lead", accent: "from-cyan-400 to-teal-500" },
  { id: "priya", name: "Priya M.", role: "Frontend Systems", accent: "from-fuchsia-400 to-violet-500" },
  { id: "jordan", name: "Jordan K.", role: "Research and QA", accent: "from-amber-400 to-orange-500" },
  { id: "sam", name: "Sam L.", role: "Backend Integrations", accent: "from-emerald-400 to-green-500" },
  { id: "wei", name: "Wei C.", role: "Presentation and Media", accent: "from-sky-400 to-blue-500" },
];

const projectSeed = {
  name: "Smart Campus Sustainability App",
  dueDate: projectDueDate.toISOString(),
};

const initialMilestones = [
  {
    id: "milestone-research",
    title: "Research complete",
    dueDate: toISODate(addDays(new Date(), 3)),
    complete: true,
  },
  {
    id: "milestone-prototype",
    title: "Prototype built",
    dueDate: toISODate(addDays(new Date(), 9)),
    complete: false,
  },
  {
    id: "milestone-submission",
    title: "Final submission",
    dueDate: toISODate(addDays(new Date(), 18)),
    complete: false,
  },
];

const channelMeta = [
  { id: "general", name: "#general", topic: "Daily sync, blockers and quick wins" },
  { id: "dev-chat", name: "#dev-chat", topic: "Product build decisions and debugging" },
  { id: "presentation-prep", name: "#presentation-prep", topic: "Slides, demo flow and speaking roles" },
];

const seededPreviewOne = createMockSvg("Wireframe Sprint", "#0f172a", "#14b8a6");
const seededPreviewTwo = createMockSvg("Presentation Draft", "#1e293b", "#f59e0b");
const seededPreviewThree = createMockSvg("Campus Impact Metrics", "#111827", "#38bdf8");

const initialChatState = {
  channels: channelMeta,
  messagesByChannel: {
    general: [
      {
        id: "msg-1",
        authorId: "alex",
        content:
          "Morning team. We are 18 days out, so today's goal is locking the prototype scope. @Priya can you confirm the dashboard widgets by lunch?",
        createdAt: addDays(new Date(), -1).toISOString(),
        readBy: ["priya", "sam", "wei"],
        reactions: [
          { emoji: "👍", userIds: ["priya", "jordan", "wei"] },
          { emoji: "🚀", userIds: ["sam"] },
        ],
        attachments: [],
        replies: [
          {
            id: "reply-1",
            authorId: "priya",
            content: "Yes, I have the meter layout ready and can share the polished version before lunch.",
            createdAt: addDays(new Date(), -1 / 2).toISOString(),
          },
        ],
      },
      {
        id: "msg-2",
        authorId: "wei",
        content: "Uploaded the latest presentation moodboard so we keep the mission-control look consistent.",
        createdAt: addDays(new Date(), -0.5).toISOString(),
        readBy: ["alex", "priya", "jordan", "sam"],
        reactions: [{ emoji: "🔥", userIds: ["alex", "priya"] }],
        attachments: [
          {
            id: "att-1",
            name: "moodboard.png",
            type: "image/png",
            url: seededPreviewTwo,
          },
        ],
        replies: [],
      },
      {
        id: "msg-3",
        authorId: "jordan",
        content: "Research summary is approved. I am moving the evidence pack to the media library next.",
        createdAt: addDays(new Date(), -0.2).toISOString(),
        readBy: ["alex", "priya"],
        reactions: [{ emoji: "✅", userIds: ["alex", "sam"] }],
        attachments: [],
        replies: [],
      },
    ],
    "dev-chat": [
      {
        id: "msg-4",
        authorId: "sam",
        content: "The kanban interactions are feeling good. Next pass is adding a stronger drag shadow and cleaner task filters.",
        createdAt: addDays(new Date(), -0.8).toISOString(),
        readBy: ["alex", "priya", "wei"],
        reactions: [{ emoji: "🛠️", userIds: ["alex", "priya"] }],
        attachments: [],
        replies: [
          {
            id: "reply-2",
            authorId: "priya",
            content: "I can handle the board polish once I land the dashboard refinements.",
            createdAt: addDays(new Date(), -0.6).toISOString(),
          },
        ],
      },
      {
        id: "msg-5",
        authorId: "priya",
        content: "@Sam I dropped the sustainability metrics mock so we can align the success meter styling.",
        createdAt: addDays(new Date(), -0.4).toISOString(),
        readBy: ["alex", "sam", "jordan"],
        reactions: [{ emoji: "👀", userIds: ["sam", "alex"] }],
        attachments: [
          {
            id: "att-2",
            name: "metrics-board.png",
            type: "image/png",
            url: seededPreviewThree,
          },
        ],
        replies: [],
      },
    ],
    "presentation-prep": [
      {
        id: "msg-6",
        authorId: "wei",
        content: "Drafted the slide order: problem, research, product walkthrough, impact metrics, next steps.",
        createdAt: addDays(new Date(), -0.7).toISOString(),
        readBy: ["alex", "jordan", "priya"],
        reactions: [{ emoji: "🎤", userIds: ["alex", "jordan"] }],
        attachments: [],
        replies: [],
      },
      {
        id: "msg-7",
        authorId: "alex",
        content: "@Wei Please make sure the demo flow includes a quick switch from task planning to team coordination.",
        createdAt: addDays(new Date(), -0.3).toISOString(),
        readBy: ["wei", "priya"],
        reactions: [{ emoji: "👌", userIds: ["wei"] }],
        attachments: [
          {
            id: "att-3",
            name: "demo-flow.png",
            type: "image/png",
            url: seededPreviewOne,
          },
        ],
        replies: [],
      },
    ],
  },
};

const initialTasks = [
  {
    id: "task-1",
    title: "Audit campus recycling behaviours",
    description: "Compile survey findings and summarise key behaviour patterns for the product narrative.",
    assigneeIds: ["jordan"],
    dueDate: toISODate(addDays(new Date(), 1)),
    priority: "High",
    status: "Backlog",
  },
  {
    id: "task-2",
    title: "Polish sustainability dashboard widgets",
    description: "Refine metric cards, progress meter copy and chart spacing for the prototype.",
    assigneeIds: ["priya"],
    dueDate: toISODate(addDays(new Date(), 2)),
    priority: "Critical",
    status: "To Do",
  },
  {
    id: "task-3",
    title: "Map onboarding copy",
    description: "Write concise guidance for first-time users joining project workspaces.",
    assigneeIds: ["alex", "wei"],
    dueDate: toISODate(addDays(new Date(), 4)),
    priority: "Medium",
    status: "To Do",
  },
  {
    id: "task-4",
    title: "Build kanban drag interactions",
    description: "Implement column drops, move states and visual cues for active drag targets.",
    assigneeIds: ["sam", "priya"],
    dueDate: toISODate(addDays(new Date(), 3)),
    priority: "High",
    status: "In Progress",
  },
  {
    id: "task-5",
    title: "Prepare presentation storyline",
    description: "Structure the verbal flow from challenge framing through demo and outcomes.",
    assigneeIds: ["wei"],
    dueDate: toISODate(addDays(new Date(), 5)),
    priority: "High",
    status: "In Progress",
  },
  {
    id: "task-6",
    title: "Review chat accessibility states",
    description: "Check contrast, hit targets and readable timestamps across message views.",
    assigneeIds: ["jordan", "alex"],
    dueDate: toISODate(addDays(new Date(), 6)),
    priority: "Medium",
    status: "Review",
  },
  {
    id: "task-7",
    title: "Prototype media library filters",
    description: "Support tag, uploader and quick actions inside the asset grid.",
    assigneeIds: ["sam"],
    dueDate: toISODate(addDays(new Date(), 7)),
    priority: "Low",
    status: "Review",
  },
  {
    id: "task-8",
    title: "Complete competitor scan",
    description: "Summarise comparable group-work tools and note differentiation points.",
    assigneeIds: ["jordan"],
    dueDate: toISODate(addDays(new Date(), -1)),
    priority: "Low",
    status: "Done",
  },
  {
    id: "task-9",
    title: "Lock visual identity system",
    description: "Confirm colours, typography and surface treatments across all modules.",
    assigneeIds: ["priya", "wei"],
    dueDate: toISODate(addDays(new Date(), 0)),
    priority: "Critical",
    status: "Done",
  },
  {
    id: "task-10",
    title: "Draft demo talking points",
    description: "Create a confident run sheet for the live walkthrough and speaker hand-offs.",
    assigneeIds: ["alex", "wei"],
    dueDate: toISODate(addDays(new Date(), 8)),
    priority: "Medium",
    status: "Backlog",
  },
];

const initialMediaLibrary = [
  {
    id: "media-1",
    name: "prototype-wireframe.png",
    type: "image/png",
    url: seededPreviewOne,
    uploaderId: "priya",
    tags: ["prototype", "ui"],
    createdAt: addDays(new Date(), -3).toISOString(),
  },
  {
    id: "media-2",
    name: "presentation-board.png",
    type: "image/png",
    url: seededPreviewTwo,
    uploaderId: "wei",
    tags: ["slides", "branding"],
    createdAt: addDays(new Date(), -2).toISOString(),
  },
  {
    id: "media-3",
    name: "research-insights.png",
    type: "image/png",
    url: seededPreviewThree,
    uploaderId: "jordan",
    tags: ["research", "metrics"],
    createdAt: addDays(new Date(), -1).toISOString(),
  },
];

const navItems = [
  { id: "chat", label: "Group Chat", short: "CH" },
  { id: "tasks", label: "Tasks", short: "TS" },
  { id: "kanban", label: "Kanban", short: "KB" },
  { id: "success", label: "Success Meter", short: "SM" },
  { id: "video", label: "Video Call", short: "VC" },
  { id: "media", label: "Media Hub", short: "MH" },
];

const statusColumns = ["Backlog", "To Do", "In Progress", "Review", "Done"];
const priorityOrder = ["Critical", "High", "Medium", "Low"];
const reactionOptions = ["👍", "🔥", "✅", "🚀", "🎯"];

function chatReducer(state, action) {
  switch (action.type) {
    case "send-message": {
      const nextMessages = [...state.messagesByChannel[action.channelId], action.message];
      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [action.channelId]: nextMessages,
        },
      };
    }
    case "add-reply": {
      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [action.channelId]: state.messagesByChannel[action.channelId].map((message) =>
            message.id === action.messageId
              ? { ...message, replies: [...message.replies, action.reply] }
              : message,
          ),
        },
      };
    }
    case "toggle-reaction": {
      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [action.channelId]: state.messagesByChannel[action.channelId].map((message) => {
            if (message.id !== action.messageId) {
              return message;
            }

            const existingReaction = message.reactions.find(
              (reaction) => reaction.emoji === action.emoji,
            );

            if (!existingReaction) {
              return {
                ...message,
                reactions: [
                  ...message.reactions,
                  { emoji: action.emoji, userIds: [action.userId] },
                ],
              };
            }

            const hasReacted = existingReaction.userIds.includes(action.userId);
            const updatedUsers = hasReacted
              ? existingReaction.userIds.filter((userId) => userId !== action.userId)
              : [...existingReaction.userIds, action.userId];

            return {
              ...message,
              reactions: message.reactions
                .map((reaction) =>
                  reaction.emoji === action.emoji
                    ? { ...reaction, userIds: updatedUsers }
                    : reaction,
                )
                .filter((reaction) => reaction.userIds.length > 0),
            };
          }),
        },
      };
    }
    default:
      return state;
  }
}

function Avatar({ member, size = "md", showStatus = false }) {
  const sizeMap = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "grid place-items-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-lg shadow-cyan-900/30",
          member?.accent ?? "from-slate-600 to-slate-700",
          sizeMap[size],
        )}
        style={{ fontFamily: "'Space Mono', monospace" }}
        title={member?.name}
      >
        {member ? initials(member.name) : "??"}
      </div>
      {showStatus ? (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
      ) : null}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const palette = {
    Low: "border-slate-700 bg-slate-800/70 text-slate-300",
    Medium: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    High: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    Critical: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };

  return (
    <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", palette[priority])}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const palette = {
    Backlog: "bg-slate-800 text-slate-300",
    "To Do": "bg-cyan-500/15 text-cyan-300",
    "In Progress": "bg-amber-500/15 text-amber-300",
    Review: "bg-violet-500/15 text-violet-300",
    Done: "bg-emerald-500/15 text-emerald-300",
  };

  return <span className={cn("rounded-full px-3 py-1 text-xs", palette[status])}>{status}</span>;
}

function PanelCard({ title, eyebrow, action, className, children }) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur",
        className,
      )}
    >
      {(title || eyebrow || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <div
                className="text-xs uppercase tracking-[0.32em] text-cyan-300/80"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20",
        className,
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function ProgressRing({ value, label, tone = "cyan" }) {
  const circumference = 2 * Math.PI * 70;
  const strokeOffset = circumference - (Math.min(value, 100) / 100) * circumference;
  const toneMap = {
    cyan: "stroke-cyan-400",
    amber: "stroke-amber-400",
    rose: "stroke-rose-400",
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          className={cn("transition-all duration-1000 ease-out", toneMap[tone])}
        />
      </svg>
      <div className="absolute text-center">
        <div
          className="text-xs uppercase tracking-[0.28em] text-slate-400"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {label}
        </div>
        <div className="mt-2 text-4xl font-bold text-white">{Math.round(value)}%</div>
      </div>
    </div>
  );
}

function MentionText({ text }) {
  const segments = text.split(/(@[A-Za-z]+)/g);
  return (
    <span>
      {segments.map((segment, index) =>
        segment.startsWith("@") ? (
          <span key={`${segment}-${index}`} className="font-semibold text-cyan-300">
            {segment}
          </span>
        ) : (
          <span key={`${segment}-${index}`}>{segment}</span>
        ),
      )}
    </span>
  );
}

function StackdApp() {
  const [activeModule, setActiveModule] = useState("chat");
  const [chatState, dispatchChat] = useReducer(chatReducer, initialChatState);
  const [tasks, setTasks] = useState(initialTasks);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [mediaItems, setMediaItems] = useState(initialMediaLibrary);
  const [activeChannelId, setActiveChannelId] = useState("general");
  const [chatDraft, setChatDraft] = useState("");
  const [chatUploads, setChatUploads] = useState([]);
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [threadReplyDraft, setThreadReplyDraft] = useState("");
  const [taskFilters, setTaskFilters] = useState({
    assigneeId: "all",
    priority: "all",
    sortBy: "dueDate",
  });
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [taskDraft, setTaskDraft] = useState({
    id: null,
    title: "",
    description: "",
    assigneeIds: ["alex"],
    dueDate: toISODate(addDays(new Date(), 3)),
    priority: "Medium",
    status: "Backlog",
  });
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [recordingsLog, setRecordingsLog] = useState([]);
  const [callControls, setCallControls] = useState({
    muted: false,
    cameraOff: false,
    screenShare: false,
    raisedHand: false,
    pip: false,
  });
  const [mediaFilter, setMediaFilter] = useState({ uploaderId: "all", tag: "" });
  const [panelVisible, setPanelVisible] = useState(false);
  const [copiedMediaId, setCopiedMediaId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const chatFileInputRef = useRef(null);
  const mediaFileInputRef = useRef(null);

  const currentUser = teamMembers[0];
  const currentChannel = chatState.channels.find((channel) => channel.id === activeChannelId);
  const activeMessages = chatState.messagesByChannel[activeChannelId] ?? [];
  const selectedThreadMessage = activeMessages.find((message) => message.id === selectedThreadId) ?? null;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "Done").length;
  const completionPercent = totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100;
  const milestoneCompletion = milestones.filter((milestone) => milestone.complete).length;
  const daysLeft = daysRemaining(projectSeed.dueDate);

  useEffect(() => {
    setPanelVisible(false);
    const timer = window.setTimeout(() => setPanelVisible(true), 20);
    return () => window.clearTimeout(timer);
  }, [activeModule]);

  useEffect(() => {
    if (!recordingActive) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRecordingElapsed((elapsed) => elapsed + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [recordingActive]);

  useEffect(() => {
    if (!copiedMediaId) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopiedMediaId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedMediaId]);

  const contributionData = useMemo(() => {
    const weightMap = {
      Backlog: 1,
      "To Do": 2,
      "In Progress": 3,
      Review: 4,
      Done: 5,
    };

    return teamMembers.map((member) => {
      const assigned = tasks.filter((task) => task.assigneeIds.includes(member.id));
      const score = assigned.reduce((sum, task) => sum + weightMap[task.status], 0);
      return { member, score, assignedCount: assigned.length };
    });
  }, [tasks]);

  const maxContribution = Math.max(...contributionData.map((item) => item.score), 1);

  const filteredTasks = useMemo(() => {
    const nextTasks = tasks.filter((task) => {
      if (taskFilters.assigneeId !== "all" && !task.assigneeIds.includes(taskFilters.assigneeId)) {
        return false;
      }

      if (taskFilters.priority !== "all" && task.priority !== taskFilters.priority) {
        return false;
      }

      return true;
    });

    const priorityRank = (priority) => priorityOrder.indexOf(priority);

    nextTasks.sort((a, b) => {
      if (taskFilters.sortBy === "priority") {
        return priorityRank(a.priority) - priorityRank(b.priority);
      }

      if (taskFilters.sortBy === "assignee") {
        return a.assigneeIds.join(",").localeCompare(b.assigneeIds.join(","));
      }

      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return nextTasks;
  }, [taskFilters, tasks]);

  const mediaTags = useMemo(
    () => [...new Set(mediaItems.flatMap((item) => item.tags).filter(Boolean))],
    [mediaItems],
  );

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      if (mediaFilter.uploaderId !== "all" && item.uploaderId !== mediaFilter.uploaderId) {
        return false;
      }

      if (mediaFilter.tag && !item.tags.some((tag) => tag.toLowerCase().includes(mediaFilter.tag.toLowerCase()))) {
        return false;
      }

      return true;
    });
  }, [mediaFilter, mediaItems]);

  const projectStatus = useMemo(() => {
    if (completionPercent >= 65 || (daysLeft >= 10 && completionPercent >= 35)) {
      return { label: "On Track", emoji: "🟢", tone: "cyan" };
    }

    if (completionPercent >= 35 || daysLeft > 5) {
      return { label: "At Risk", emoji: "🟡", tone: "amber" };
    }

    return { label: "Critical", emoji: "🔴", tone: "rose" };
  }, [completionPercent, daysLeft]);

  function memberById(id) {
    return teamMembers.find((member) => member.id === id);
  }

  function resetTaskDraft(status = "Backlog") {
    setTaskDraft({
      id: null,
      title: "",
      description: "",
      assigneeIds: ["alex"],
      dueDate: toISODate(addDays(new Date(), 3)),
      priority: "Medium",
      status,
    });
  }

  function openNewTaskEditor(status = "Backlog") {
    resetTaskDraft(status);
    setTaskEditorOpen(true);
  }

  function openExistingTask(task) {
    setTaskDraft({ ...task });
    setTaskEditorOpen(true);
  }

  function handleChatFiles(fileList) {
    const nextUploads = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      }));

    setChatUploads((current) => [...current, ...nextUploads]);
  }

  function sendChatMessage() {
    if (!chatDraft.trim() && chatUploads.length === 0) {
      return;
    }

    dispatchChat({
      type: "send-message",
      channelId: activeChannelId,
      message: {
        id: `msg-${Date.now()}`,
        authorId: currentUser.id,
        content: chatDraft.trim(),
        createdAt: new Date().toISOString(),
        readBy: ["priya", "sam"],
        reactions: [],
        attachments: chatUploads,
        replies: [],
      },
    });

    setChatDraft("");
    setChatUploads([]);
  }

  function sendThreadReply() {
    if (!selectedThreadId || !threadReplyDraft.trim()) {
      return;
    }

    dispatchChat({
      type: "add-reply",
      channelId: activeChannelId,
      messageId: selectedThreadId,
      reply: {
        id: `reply-${Date.now()}`,
        authorId: currentUser.id,
        content: threadReplyDraft.trim(),
        createdAt: new Date().toISOString(),
      },
    });

    setThreadReplyDraft("");
  }

  function toggleReaction(messageId, emoji) {
    dispatchChat({
      type: "toggle-reaction",
      channelId: activeChannelId,
      messageId,
      emoji,
      userId: currentUser.id,
    });
  }

  function handleTaskSave(event) {
    event.preventDefault();

    if (!taskDraft.title.trim()) {
      return;
    }

    const nextTask = {
      ...taskDraft,
      title: taskDraft.title.trim(),
      description: taskDraft.description.trim(),
    };

    if (taskDraft.id) {
      setTasks((current) => current.map((task) => (task.id === taskDraft.id ? nextTask : task)));
    } else {
      setTasks((current) => [...current, { ...nextTask, id: `task-${Date.now()}` }]);
    }

    setTaskEditorOpen(false);
    resetTaskDraft();
  }

  function handleTaskDelete() {
    if (!taskDraft.id) {
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== taskDraft.id));
    setTaskEditorOpen(false);
    resetTaskDraft();
  }

  function moveTask(taskId, status) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
  }

  function toggleMilestone(milestoneId) {
    setMilestones((current) =>
      current.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, complete: !milestone.complete } : milestone,
      ),
    );
  }

  function toggleCallControl(key) {
    setCallControls((current) => ({ ...current, [key]: !current[key] }));
  }

  function handleRecordingToggle() {
    if (!recordingActive) {
      setRecordingElapsed(0);
      setRecordingActive(true);
      return;
    }

    const blob = new Blob(
      [
        `Mock Stackd recording\nProject: ${projectSeed.name}\nCaptured at: ${new Date().toISOString()}\nDuration: ${formatDuration(recordingElapsed)}`,
      ],
      { type: "audio/webm" },
    );
    const url = URL.createObjectURL(blob);
    setRecordingsLog((current) => [
      {
        id: `recording-${Date.now()}`,
        name: `standup-${new Date().toISOString().slice(11, 19).replaceAll(":", "-")}.webm`,
        url,
        createdAt: new Date().toISOString(),
        duration: recordingElapsed,
      },
      ...current,
    ]);
    setRecordingActive(false);
    setRecordingElapsed(0);
  }

  function handleMediaFiles(fileList) {
    const nextItems = Array.from(fileList).map((file) => ({
      id: `media-${Date.now()}-${file.name}`,
      name: file.name,
      type: file.type || "application/octet-stream",
      url: URL.createObjectURL(file),
      uploaderId: currentUser.id,
      tags: ["uploaded"],
      createdAt: new Date().toISOString(),
    }));

    setMediaItems((current) => [...nextItems, ...current]);
  }

  function updateMediaTags(mediaId, rawValue) {
    const nextTags = rawValue
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setMediaItems((current) =>
      current.map((item) => (item.id === mediaId ? { ...item, tags: nextTags } : item)),
    );
  }

  async function copyMediaLink(item) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(item.url);
      }
      setCopiedMediaId(item.id);
    } catch {
      setCopiedMediaId(item.id);
    }
  }

  function downloadFile(item) {
    const anchor = document.createElement("a");
    anchor.href = item.url;
    anchor.download = item.name;
    anchor.click();
  }

  function deleteMedia(item) {
    setMediaItems((current) => current.filter((entry) => entry.id !== item.id));
    if (item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  }

  function renderTaskCard(task, compact = false) {
    return (
      <button
        key={task.id}
        type="button"
        draggable
        onDragStart={() => setDraggedTaskId(task.id)}
        onDragEnd={() => setDraggedTaskId(null)}
        onClick={() => openExistingTask(task)}
        className={cn(
          "w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-950/20",
          draggedTaskId === task.id ? "opacity-70 shadow-2xl shadow-cyan-950/40" : "",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">{task.title}</div>
            {!compact ? (
              <p className="mt-2 text-sm text-slate-400">{task.description}</p>
            ) : null}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex -space-x-2">
            {task.assigneeIds.map((assigneeId) => (
              <Avatar key={assigneeId} member={memberById(assigneeId)} size="sm" />
            ))}
          </div>
          <div className="text-xs text-slate-400">Due {formatDate(task.dueDate)}</div>
        </div>
      </button>
    );
  }

  function renderChatModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <PanelCard title="Channels" eyebrow="Conversation Grid">
          <div className="space-y-3">
            {chatState.channels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              const messageCount = chatState.messagesByChannel[channel.id]?.length ?? 0;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => {
                    setActiveChannelId(channel.id);
                    setSelectedThreadId(null);
                  }}
                  className={cn(
                    "w-full rounded-3xl border p-4 text-left transition",
                    isActive
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-white/10 bg-slate-950/60 hover:border-white/20",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{channel.name}</div>
                      <div className="mt-1 text-sm text-slate-400">{channel.topic}</div>
                    </div>
                    <div
                      className="rounded-2xl bg-slate-900 px-3 py-2 text-xs text-slate-300"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {messageCount}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PanelCard>

        <PanelCard
          title={currentChannel?.name}
          eyebrow="Live Team Chat"
          action={
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              Visual read receipts enabled
            </div>
          }
        >
          <div className="mb-5 rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
            {currentChannel?.topic}
          </div>

          <div className="max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {activeMessages.map((message) => {
              const author = memberById(message.authorId);
              return (
                <div key={message.id} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar member={author} showStatus />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">{author?.name}</span>
                        <span className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</span>
                      </div>
                      {message.content ? (
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          <MentionText text={message.content} />
                        </p>
                      ) : null}

                      {message.attachments.length > 0 ? (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {message.attachments.map((attachment) => (
                            <button
                              key={attachment.id}
                              type="button"
                              onClick={() => setActiveLightbox(attachment)}
                              className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-left"
                            >
                              <img src={attachment.url} alt={attachment.name} className="h-40 w-full object-cover" />
                              <div className="px-3 py-2 text-xs text-slate-300">{attachment.name}</div>
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {reactionOptions.map((emoji) => {
                          const reaction = message.reactions.find((item) => item.emoji === emoji);
                          const count = reaction?.userIds.length ?? 0;
                          const active = reaction?.userIds.includes(currentUser.id);
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => toggleReaction(message.id, emoji)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs transition",
                                active
                                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                                  : "border-white/10 bg-slate-900 text-slate-400 hover:border-white/20",
                              )}
                            >
                              {emoji} {count > 0 ? count : ""}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => setSelectedThreadId(message.id)}
                          className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20"
                        >
                          Thread {message.replies.length > 0 ? `(${message.replies.length})` : ""}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Read by</span>
                          <div className="flex -space-x-2">
                            {message.readBy.map((userId) => (
                              <Avatar key={userId} member={memberById(userId)} size="sm" />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">{formatTime(message.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
            {chatUploads.length > 0 ? (
              <div className="mb-4 flex flex-wrap gap-3">
                {chatUploads.map((upload) => (
                  <div key={upload.id} className="relative overflow-hidden rounded-2xl border border-white/10">
                    <img src={upload.url} alt={upload.name} className="h-20 w-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => setChatUploads((current) => current.filter((item) => item.id !== upload.id))}
                      className="absolute right-2 top-2 rounded-full bg-slate-950/90 px-2 py-1 text-[10px] text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <Textarea
              rows={4}
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Message the channel, use @mentions, or attach a screenshot..."
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200"
                >
                  Upload photo
                </button>
                <input
                  ref={chatFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => handleChatFiles(event.target.files ?? [])}
                />
                <div className="text-xs text-slate-500">Inline previews open in a lightbox</div>
              </div>
              <button
                type="button"
                onClick={sendChatMessage}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                Send message
              </button>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Thread View" eyebrow="Deep Focus">
          {selectedThreadMessage ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="text-sm font-semibold text-white">
                  {memberById(selectedThreadMessage.authorId)?.name}
                </div>
                <p className="mt-2 text-sm text-slate-300">{selectedThreadMessage.content}</p>
              </div>
              <div className="space-y-3">
                {selectedThreadMessage.replies.map((reply) => (
                  <div key={reply.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">
                        {memberById(reply.authorId)?.name}
                      </div>
                      <div className="text-xs text-slate-500">{formatDateTime(reply.createdAt)}</div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{reply.content}</p>
                  </div>
                ))}
              </div>
              <Textarea
                rows={4}
                value={threadReplyDraft}
                onChange={(event) => setThreadReplyDraft(event.target.value)}
                placeholder="Reply in thread..."
              />
              <button
                type="button"
                onClick={sendThreadReply}
                className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950"
              >
                Post thread reply
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-6 text-center text-sm text-slate-500">
              Select any message thread to review context, follow-ups and decisions in one place.
            </div>
          )}
        </PanelCard>
      </div>
    );
  }

  function renderTasksModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PanelCard
          title="Task Assignment System"
          eyebrow="Operations"
          action={
            <button
              type="button"
              onClick={() => openNewTaskEditor("Backlog")}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Create task
            </button>
          }
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Select
              value={taskFilters.assigneeId}
              onChange={(event) =>
                setTaskFilters((current) => ({ ...current, assigneeId: event.target.value }))
              }
            >
              <option value="all">All assignees</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
            <Select
              value={taskFilters.priority}
              onChange={(event) =>
                setTaskFilters((current) => ({ ...current, priority: event.target.value }))
              }
            >
              <option value="all">All priorities</option>
              {priorityOrder.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
            <Select
              value={taskFilters.sortBy}
              onChange={(event) =>
                setTaskFilters((current) => ({ ...current, sortBy: event.target.value }))
              }
            >
              <option value="dueDate">Sort by due date</option>
              <option value="priority">Sort by priority</option>
              <option value="assignee">Sort by assignee</option>
            </Select>
          </div>

          <div className="mt-5 space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 transition hover:border-cyan-400/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{task.title}</div>
                    <p className="mt-2 max-w-3xl text-sm text-slate-400">{task.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Assigned</span>
                    <div className="flex -space-x-2">
                      {task.assigneeIds.map((assigneeId) => (
                        <Avatar key={assigneeId} member={memberById(assigneeId)} size="sm" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>Due {formatDate(task.dueDate)}</span>
                    <button
                      type="button"
                      onClick={() => openExistingTask(task)}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-slate-200"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Assignment Snapshot" eyebrow="Team Load">
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const assigned = tasks.filter((task) => task.assigneeIds.includes(member.id));
              const urgentCount = assigned.filter(
                (task) => task.priority === "Critical" || task.priority === "High",
              ).length;
              return (
                <div key={member.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar member={member} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white">{member.name}</div>
                      <div className="text-sm text-slate-400">{member.role}</div>
                    </div>
                    <div
                      className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-cyan-300"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {assigned.length} tasks
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <span>Urgent items</span>
                    <span className="text-amber-300">{urgentCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </div>
    );
  }

  function renderKanbanModule() {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <PanelCard title={`${totalTasks}`} eyebrow="All Tasks" className="min-h-[150px]">
            <div className="text-sm text-slate-400">Every assignment feeds this live board.</div>
          </PanelCard>
          <PanelCard title={`${tasks.filter((task) => task.status === "In Progress").length}`} eyebrow="In Progress" className="min-h-[150px]">
            <div className="text-sm text-slate-400">Drag cards to keep momentum visible.</div>
          </PanelCard>
          <PanelCard title={`${doneTasks}`} eyebrow="Done" className="min-h-[150px]">
            <div className="text-sm text-slate-400">Completed work updates the success meter automatically.</div>
          </PanelCard>
        </div>
        <div className="grid gap-5 xl:grid-cols-5">
          {statusColumns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column);
            return (
              <div
                key={column}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => draggedTaskId && moveTask(draggedTaskId, column)}
                className="rounded-[30px] border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/40"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{column}</div>
                    <div className="text-xs text-slate-500">{columnTasks.length} cards</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNewTaskEditor(column)}
                    className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                  >
                    Add card
                  </button>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => renderTaskCard(task, true))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderSuccessModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <PanelCard title="Project Success Meter" eyebrow="Mission Status">
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <ProgressRing value={completionPercent} label="Completion" tone={projectStatus.tone} />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Deadline</div>
                  <div className="mt-3 text-3xl font-bold text-white">{daysLeft}</div>
                  <div className="mt-2 text-sm text-slate-400">days remaining</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Milestones</div>
                  <div className="mt-3 text-3xl font-bold text-white">
                    {milestoneCompletion}/{milestones.length}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">completed checkpoints</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Signal</div>
                  <div className="mt-3 text-2xl font-bold text-white">
                    {projectStatus.label} {projectStatus.emoji}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">live delivery health</div>
                </div>
              </div>
            </div>
          </PanelCard>

          <PanelCard title="Contribution Score" eyebrow="Per Member Output">
            <div className="space-y-4">
              {contributionData.map((entry) => (
                <div key={entry.member.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar member={entry.member} />
                      <div>
                        <div className="font-semibold text-white">{entry.member.name}</div>
                        <div className="text-sm text-slate-400">{entry.assignedCount} assigned tasks</div>
                      </div>
                    </div>
                    <div
                      className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-cyan-300"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {entry.score} pts
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-300 transition-all duration-1000"
                      style={{ width: `${(entry.score / maxContribution) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>

        <PanelCard title="Milestone Tracker" eyebrow="Checkpoint Control">
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <label
                key={milestone.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4"
              >
                <div>
                  <div className="font-semibold text-white">{milestone.title}</div>
                  <div className="mt-1 text-sm text-slate-400">Target {formatDate(milestone.dueDate)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm", milestone.complete ? "text-emerald-300" : "text-slate-500")}>
                    {milestone.complete ? "Complete" : "Pending"}
                  </span>
                  <input
                    type="checkbox"
                    checked={milestone.complete}
                    onChange={() => toggleMilestone(milestone.id)}
                    className="h-5 w-5 rounded border-white/20 bg-slate-950 text-cyan-400"
                  />
                </div>
              </label>
            ))}
          </div>
        </PanelCard>
      </div>
    );
  }

  function renderVideoModule() {
    const participantStates = [
      { memberId: "alex", status: recordingActive ? "Recording host" : "Facilitating" },
      { memberId: "priya", status: "Sharing design decisions" },
      { memberId: "jordan", status: "Reviewing evidence pack" },
      { memberId: "sam", status: "Walking through build" },
      { memberId: "wei", status: "Preparing demo story" },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PanelCard title="Video Call Panel" eyebrow="Collab Room">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {participantStates.map((participant, index) => {
              const member = memberById(participant.memberId);
              const isSelf = participant.memberId === currentUser.id;
              return (
                <div
                  key={participant.memberId}
                  className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4"
                >
                  <div className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs text-slate-300">
                    Cam {isSelf && callControls.cameraOff ? "Off" : "On"}
                  </div>
                  <div className="flex h-56 items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/60">
                    <Avatar member={member} size="lg" showStatus />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{member?.name}</div>
                      <div className="text-sm text-slate-400">{participant.status}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-950/80 px-3 py-2 text-xs text-cyan-300">
                      Tile {index + 1}
                    </div>
                  </div>
                  {isSelf && callControls.screenShare ? (
                    <div className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
                      Screen sharing active
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { key: "muted", label: callControls.muted ? "Unmute" : "Mute" },
                { key: "cameraOff", label: callControls.cameraOff ? "Camera On" : "Camera Off" },
                { key: "screenShare", label: callControls.screenShare ? "Stop Share" : "Share Screen" },
                { key: "raisedHand", label: callControls.raisedHand ? "Lower Hand" : "Raise Hand" },
                { key: "pip", label: callControls.pip ? "Exit PiP" : "Picture in Picture" },
              ].map((control) => (
                <button
                  key={control.key}
                  type="button"
                  onClick={() => toggleCallControl(control.key)}
                  className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20"
                >
                  {control.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-2xl bg-rose-500/90 px-5 py-3 text-sm font-semibold text-white"
            >
              End Call
            </button>
          </div>
        </PanelCard>

        <div className="space-y-6">
          <PanelCard title="Participants" eyebrow="Attendance">
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <Avatar member={member} showStatus />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-sm text-slate-400">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard title="Recordings" eyebrow="Session Capture">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">Audio Recorder</div>
                  <div className="text-sm text-slate-400">Create downloadable mock standup logs</div>
                </div>
                {recordingActive ? (
                  <div className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-400" />
                    REC {formatDuration(recordingElapsed)}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleRecordingToggle}
                className={cn(
                  "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold",
                  recordingActive
                    ? "bg-rose-500/90 text-white"
                    : "bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950",
                )}
              >
                {recordingActive ? "Stop recording" : "Start recording"}
              </button>
            </div>

            <div className="space-y-3">
              {recordingsLog.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/50 p-6 text-center text-sm text-slate-500">
                  No recordings yet. Start and stop the recorder to generate a mock audio file.
                </div>
              ) : (
                recordingsLog.map((recording) => (
                  <div key={recording.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="font-semibold text-white">{recording.name}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {formatDateTime(recording.createdAt)} • {formatDuration(recording.duration)}
                    </div>
                    <a
                      href={recording.url}
                      download={recording.name}
                      className="mt-4 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200"
                    >
                      Download file
                    </a>
                  </div>
                ))
              )}
            </div>
          </PanelCard>
        </div>
      </div>
    );
  }

  function renderMediaModule() {
    return (
      <div className="space-y-6">
        <PanelCard title="Photo / File Upload Hub" eyebrow="Asset Library">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleMediaFiles(event.dataTransfer.files);
            }}
            className="rounded-[30px] border border-dashed border-cyan-400/30 bg-cyan-400/5 p-8 text-center"
          >
            <div
              className="text-xs uppercase tracking-[0.35em] text-cyan-300/80"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Drag and drop uploads
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white">Drop design files, screenshots or notes here</h3>
            <p className="mt-2 text-sm text-slate-400">Everything stays in memory for this session and appears instantly in the gallery below.</p>
            <button
              type="button"
              onClick={() => mediaFileInputRef.current?.click()}
              className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              Choose files
            </button>
            <input
              ref={mediaFileInputRef}
              type="file"
              hidden
              multiple
              onChange={(event) => handleMediaFiles(event.target.files ?? [])}
            />
          </div>
        </PanelCard>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <PanelCard title="Filters" eyebrow="Narrow Results">
            <div className="space-y-4">
              <Select
                value={mediaFilter.uploaderId}
                onChange={(event) =>
                  setMediaFilter((current) => ({ ...current, uploaderId: event.target.value }))
                }
              >
                <option value="all">All uploaders</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
              <Input
                value={mediaFilter.tag}
                onChange={(event) =>
                  setMediaFilter((current) => ({ ...current, tag: event.target.value }))
                }
                placeholder="Filter by tag"
              />
              <div className="flex flex-wrap gap-2">
                {mediaTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMediaFilter((current) => ({ ...current, tag }))}
                    className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </PanelCard>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMedia.map((item) => {
              const uploader = memberById(item.uploaderId);
              const isImage = item.type.startsWith("image/");
              return (
                <PanelCard key={item.id} className="overflow-hidden p-0">
                  {isImage ? (
                    <button type="button" onClick={() => setActiveLightbox(item)} className="block w-full">
                      <img src={item.url} alt={item.name} className="h-48 w-full object-cover" />
                    </button>
                  ) : (
                    <div className="grid h-48 place-items-center bg-slate-950/70 text-sm text-slate-400">
                      File preview unavailable
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-400">{formatDateTime(item.createdAt)}</div>
                      </div>
                      <Avatar member={uploader} size="sm" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Input
                      className="mt-4"
                      defaultValue={item.tags.join(", ")}
                      onBlur={(event) => updateMediaTags(item.id, event.target.value)}
                      placeholder="Add tags separated by commas"
                    />

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => downloadFile(item)}
                        className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => copyMediaLink(item)}
                        className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-200"
                      >
                        {copiedMediaId === item.id ? "Copied" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMedia(item)}
                        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </PanelCard>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderActiveModule() {
    switch (activeModule) {
      case "chat":
        return renderChatModule();
      case "tasks":
        return renderTasksModule();
      case "kanban":
        return renderKanbanModule();
      case "success":
        return renderSuccessModule();
      case "video":
        return renderVideoModule();
      case "media":
        return renderMediaModule();
      default:
        return null;
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:block">
          <div>
            <div
              className="text-xs uppercase tracking-[0.35em] text-cyan-300/80"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Stackd
            </div>
            <h1
              className="mt-4 text-3xl font-bold text-white"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Student Collaboration Platform
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              NASA mission control energy, tuned for university teams shipping high-stakes group work.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = item.id === activeModule;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left transition",
                    active
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-transparent bg-transparent hover:border-white/10 hover:bg-slate-900/80",
                  )}
                >
                  <div
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold",
                      active ? "bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950" : "bg-slate-900 text-slate-300",
                    )}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {item.short}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-sm text-slate-500">Persistent navigation</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
            <div className="text-sm text-slate-400">Current sprint health</div>
            <div className="mt-2 text-2xl font-bold text-white">
              {projectStatus.label} {projectStatus.emoji}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 transition-all duration-1000"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div
                  className="text-xs uppercase tracking-[0.35em] text-cyan-300/80"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Project Room
                </div>
                <div className="mt-2 text-2xl font-bold text-white">{projectSeed.name}</div>
                <div className="mt-1 text-sm text-slate-400">
                  Deadline in {daysLeft} days • Due {formatDate(projectSeed.dueDate)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex -space-x-3">
                  {teamMembers.map((member) => (
                    <Avatar key={member.id} member={member} showStatus />
                  ))}
                </div>
                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {doneTasks}/{totalTasks} tasks complete
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 lg:px-8">
            <div
              className={cn(
                "transition-all duration-300",
                panelVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              {renderActiveModule()}
            </div>
          </div>
        </main>
      </div>

      {taskEditorOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleTaskSave}
            className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="text-xs uppercase tracking-[0.35em] text-cyan-300/80"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Task Editor
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {taskDraft.id ? "Edit task" : "Create task"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTaskEditorOpen(false);
                  resetTaskDraft();
                }}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <Input
                value={taskDraft.title}
                onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Task title"
              />
              <Textarea
                rows={4}
                value={taskDraft.description}
                onChange={(event) =>
                  setTaskDraft((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Task description"
              />
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  type="date"
                  value={taskDraft.dueDate}
                  onChange={(event) => setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))}
                />
                <Select
                  value={taskDraft.priority}
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, priority: event.target.value }))
                  }
                >
                  {priorityOrder.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
                <Select
                  value={taskDraft.status}
                  onChange={(event) =>
                    setTaskDraft((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  {statusColumns.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="mb-3 text-sm font-medium text-slate-300">Assign team members</div>
                <div className="flex flex-wrap gap-3">
                  {teamMembers.map((member) => {
                    const active = taskDraft.assigneeIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() =>
                          setTaskDraft((current) => {
                            const exists = current.assigneeIds.includes(member.id);
                            const nextAssignees = exists
                              ? current.assigneeIds.filter((id) => id !== member.id)
                              : [...current.assigneeIds, member.id];

                            return {
                              ...current,
                              assigneeIds: nextAssignees.length > 0 ? nextAssignees : [member.id],
                            };
                          })
                        }
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                          active
                            ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                            : "border-white/10 bg-slate-950/70 text-slate-300",
                        )}
                      >
                        <Avatar member={member} size="sm" />
                        {member.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {taskDraft.id ? (
                  <button
                    type="button"
                    onClick={handleTaskDelete}
                    className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    Delete task
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTaskEditorOpen(false);
                    resetTaskDraft();
                  }}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-500 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Save task
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      {activeLightbox ? (
        <button
          type="button"
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-6"
        >
          <div className="max-w-5xl">
            <img src={activeLightbox.url} alt={activeLightbox.name} className="max-h-[80vh] rounded-[32px] border border-white/10" />
            <div className="mt-4 text-center text-sm text-slate-300">{activeLightbox.name}</div>
          </div>
        </button>
      ) : null}
    </div>
  );
}

export default StackdApp;
