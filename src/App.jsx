import { useState, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   STACKD — Student Collaboration Platform
   ═══════════════════════════════════════════════════════════════ */

// ── Team ─────────────────────────────────────────────────────
const TEAM = [
  { id: 'alex', name: 'Alex T.', initials: 'AT', color: 'bg-teal-500', text: 'text-teal-400' },
  { id: 'priya', name: 'Priya M.', initials: 'PM', color: 'bg-amber-500', text: 'text-amber-400' },
  { id: 'jordan', name: 'Jordan K.', initials: 'JK', color: 'bg-violet-500', text: 'text-violet-400' },
  { id: 'sam', name: 'Sam L.', initials: 'SL', color: 'bg-rose-500', text: 'text-rose-400' },
  { id: 'wei', name: 'Wei C.', initials: 'WC', color: 'bg-sky-500', text: 'text-sky-400' },
];
const member = (id) => TEAM.find((m) => m.id === id) || TEAM[0];

const PROJECT_DEADLINE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 18);
  d.setHours(23, 59, 59);
  return d;
})();

// ── Priority / Status Config ─────────────────────────────────
const PRIORITY_CFG = {
  low: { label: 'Low', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-l-blue-400', dot: 'bg-blue-400' },
  medium: { label: 'Medium', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-l-amber-400', dot: 'bg-amber-400' },
  high: { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-l-orange-400', dot: 'bg-orange-400' },
  critical: { label: 'Critical', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-l-red-400', dot: 'bg-red-400' },
};

const KANBAN_COLS = [
  { key: 'backlog', label: 'Backlog', accent: 'bg-slate-500' },
  { key: 'todo', label: 'To Do', accent: 'bg-blue-500' },
  { key: 'inprogress', label: 'In Progress', accent: 'bg-teal-500' },
  { key: 'review', label: 'Review', accent: 'bg-amber-500' },
  { key: 'done', label: 'Done', accent: 'bg-green-500' },
];

const STATUS_LABELS = {
  backlog: 'Backlog', todo: 'To Do', inprogress: 'In Progress', review: 'Review', done: 'Done',
};

// ── Mock Tasks ───────────────────────────────────────────────
const SEED_TASKS = [
  { id: 1, title: 'Research campus energy usage data', desc: 'Collect and analyze energy consumption data from university facilities.', assignees: ['alex', 'wei'], due: '2026-03-15', priority: 'high', status: 'done' },
  { id: 2, title: 'Design wireframes for dashboard', desc: 'Create low-fi wireframes for the sustainability dashboard view.', assignees: ['priya'], due: '2026-03-16', priority: 'high', status: 'done' },
  { id: 3, title: 'Set up React project scaffold', desc: 'Initialize the project with Vite, configure Tailwind and folder structure.', assignees: ['jordan'], due: '2026-03-14', priority: 'medium', status: 'done' },
  { id: 4, title: 'Build carbon footprint calculator', desc: 'Implement the core calculator logic for estimating carbon footprint per building.', assignees: ['jordan', 'sam'], due: '2026-03-22', priority: 'critical', status: 'inprogress' },
  { id: 5, title: 'Create data visualization components', desc: 'Build reusable chart components for energy data display.', assignees: ['wei'], due: '2026-03-20', priority: 'high', status: 'inprogress' },
  { id: 6, title: 'User authentication flow', desc: 'Implement login/signup with university SSO integration.', assignees: ['sam'], due: '2026-03-21', priority: 'medium', status: 'todo' },
  { id: 7, title: 'API integration with campus sensors', desc: 'Connect to the IoT sensor API for real-time data feeds.', assignees: ['alex', 'jordan'], due: '2026-03-23', priority: 'high', status: 'todo' },
  { id: 8, title: 'Write unit tests for calculator', desc: 'Comprehensive test suite for the carbon footprint calculation engine.', assignees: ['sam'], due: '2026-03-24', priority: 'medium', status: 'backlog' },
  { id: 9, title: 'Design presentation slides', desc: 'Create the final presentation deck for the project showcase.', assignees: ['priya', 'alex'], due: '2026-03-26', priority: 'low', status: 'backlog' },
  { id: 10, title: 'Accessibility audit', desc: 'Run WCAG 2.1 AA compliance checks on all components.', assignees: ['wei'], due: '2026-03-25', priority: 'medium', status: 'review' },
  { id: 11, title: 'Mobile responsive layout', desc: 'Ensure all pages are fully responsive down to 375px width.', assignees: ['priya'], due: '2026-03-22', priority: 'high', status: 'review' },
  { id: 12, title: 'Deploy staging environment', desc: 'Set up Vercel preview deployment with CI/CD pipeline.', assignees: ['jordan'], due: '2026-03-19', priority: 'medium', status: 'todo' },
];

// ── Mock Channels ────────────────────────────────────────────
const SEED_CHANNELS = [
  {
    id: 'general', name: 'general', icon: '💬',
    messages: [
      { id: 1, sender: 'alex', text: 'Hey team! Kicked off the project repo yesterday. Everyone should have access now.', time: '10:32 AM', reactions: { '🚀': ['priya', 'jordan'] }, read: true },
      { id: 2, sender: 'priya', text: 'Got it! The wireframes are coming along nicely. Will share in #dev-chat by tomorrow.', time: '10:45 AM', reactions: { '👍': ['alex'] }, read: true },
      { id: 3, sender: 'jordan', text: '@wei can you start on the chart components? I\'ll have the scaffold ready by EOD.', time: '11:02 AM', reactions: {}, read: true },
      { id: 4, sender: 'wei', text: 'On it! Was looking at Recharts vs D3 — thinking Recharts for speed since we have 18 days.', time: '11:15 AM', reactions: { '💯': ['jordan', 'sam'] }, read: true },
      { id: 5, sender: 'sam', text: 'Good call. I\'ll handle the auth flow. Does everyone prefer SSO-only or email+password fallback?', time: '11:30 AM', reactions: {}, read: false },
      { id: 6, sender: 'alex', text: 'SSO-only keeps it simpler. Let\'s go with that for the MVP.', time: '11:42 AM', reactions: { '✅': ['sam', 'priya', 'wei'] }, read: false },
    ],
  },
  {
    id: 'dev-chat', name: 'dev-chat', icon: '🛠️',
    messages: [
      { id: 1, sender: 'jordan', text: 'Project scaffold is up! Using Vite + React + Tailwind. Check the README for setup instructions.', time: '2:15 PM', reactions: { '🎉': ['alex', 'wei'] }, read: true },
      { id: 2, sender: 'wei', text: 'Nice setup! Quick question — are we using TypeScript or plain JS?', time: '2:30 PM', reactions: {}, read: true },
      { id: 3, sender: 'jordan', text: 'Plain JS for now to move fast. We can migrate later if needed.', time: '2:35 PM', reactions: { '👍': ['wei'] }, read: true },
      { id: 4, sender: 'sam', text: 'Found great sensor API docs: https://campus-iot.edu/api/v2 — bookmarking for later.', time: '3:10 PM', reactions: { '🔖': ['alex', 'jordan'] }, read: true },
      { id: 5, sender: 'alex', text: 'The energy dataset is huge — 2.3 GB of readings from the last 3 years. I\'ll preprocess and sample it down.', time: '4:00 PM', reactions: { '📊': ['wei'] }, read: true },
    ],
  },
  {
    id: 'presentation-prep', name: 'presentation-prep', icon: '🎤',
    messages: [
      { id: 1, sender: 'priya', text: 'Started a slide outline. Thinking: Problem → Solution → Demo → Impact → Q&A', time: '9:00 AM', reactions: { '🔥': ['alex'] }, read: true },
      { id: 2, sender: 'alex', text: 'Love it. I can handle the Problem and Impact sections since I have the research data.', time: '9:20 AM', reactions: {}, read: true },
      { id: 3, sender: 'priya', text: '@jordan and @sam, can you prep the demo walkthrough?', time: '9:25 AM', reactions: { '👍': ['jordan', 'sam'] }, read: true },
    ],
  },
];

// ── Mock Milestones ──────────────────────────────────────────
const SEED_MILESTONES = [
  { id: 1, title: 'Research complete', done: true, due: '2026-03-15' },
  { id: 2, title: 'Prototype built', done: false, due: '2026-03-22' },
  { id: 3, title: 'Final submission', done: false, due: '2026-03-28' },
];

// ── Mock Files ───────────────────────────────────────────────
const SEED_FILES = [
  { id: 1, name: 'wireframe-dashboard.png', type: 'image', uploader: 'priya', tags: ['design', 'wireframe'], at: '2026-03-10', size: '2.4 MB' },
  { id: 2, name: 'energy-data-2025.csv', type: 'file', uploader: 'alex', tags: ['data', 'research'], at: '2026-03-09', size: '840 KB' },
  { id: 3, name: 'component-library.png', type: 'image', uploader: 'jordan', tags: ['design', 'components'], at: '2026-03-11', size: '1.8 MB' },
  { id: 4, name: 'api-documentation.pdf', type: 'file', uploader: 'sam', tags: ['docs', 'api'], at: '2026-03-10', size: '520 KB' },
  { id: 5, name: 'campus-aerial-view.png', type: 'image', uploader: 'wei', tags: ['reference', 'campus'], at: '2026-03-08', size: '3.1 MB' },
  { id: 6, name: 'meeting-notes-week1.md', type: 'file', uploader: 'alex', tags: ['notes', 'meeting'], at: '2026-03-07', size: '12 KB' },
];

// ── Icon Component ───────────────────────────────────────────
function Ico({ name, size = 20, className = '' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', className };
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    tasks: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
    kanban: <><rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" /></>,
    files: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    clip: <><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></>,
    mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>,
    grip: <><circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" /></>,
    chevDown: <><polyline points="6 9 12 15 18 9" /></>,
    hash: <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
  };
  return <svg {...p}>{icons[name]}</svg>;
}

// ── Reusable Components ──────────────────────────────────────
function Avatar({ id, size = 'md', className = '' }) {
  const m = member(id);
  const s = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm', xl: 'w-12 h-12 text-base' };
  return (
    <div className={`${s[size]} ${m.color} rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`} title={m.name}>
      {m.initials}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const c = PRIORITY_CFG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold font-mono">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <Ico name="x" size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Dropdown({ label, value, onChange, options, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs text-slate-400 mb-1 font-medium">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Ico name="chevDown" size={14} className="absolute right-3 top-1/2 translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'chat', icon: 'chat', label: 'Chat' },
  { key: 'tasks', icon: 'tasks', label: 'Tasks' },
  { key: 'kanban', icon: 'kanban', label: 'Board' },
  { key: 'files', icon: 'files', label: 'Files' },
];

function Sidebar({ active, onNav }) {
  return (
    <aside className="w-[72px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-5 gap-2 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
        <span className="font-mono font-bold text-white text-sm">S</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            className={`group relative flex flex-col items-center gap-0.5 p-2.5 rounded-xl transition-all duration-200 ${
              active === item.key
                ? 'bg-teal-500/15 text-teal-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            {active === item.key && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-teal-400 rounded-r-full" />
            )}
            <Ico name={item.icon} size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <Avatar id="alex" size="md" className="ring-2 ring-teal-500/40 cursor-pointer" />
    </aside>
  );
}

// ── Top Bar ──────────────────────────────────────────────────
function TopBar({ isRecording, recordingTime, onToggleRecording }) {
  const daysLeft = Math.max(0, Math.ceil((PROJECT_DEADLINE - new Date()) / (1000 * 60 * 60 * 24)));
  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-mono font-bold text-white tracking-tight">Smart Campus Sustainability App</h1>
        <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-full text-[11px] text-slate-400 font-medium">
          GROUP PROJECT
        </span>
      </div>

      <div className="flex items-center gap-4">
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 border border-red-500/30 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-mono text-red-400">{fmtTime(recordingTime)}</span>
          </div>
        )}
        <button
          onClick={onToggleRecording}
          className={`p-2 rounded-lg transition-colors ${
            isRecording ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <Ico name="mic" size={18} />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
          <Ico name="clock" size={14} className="text-amber-400" />
          <span className="text-xs font-mono font-medium text-amber-400">{daysLeft}d left</span>
        </div>

        <div className="flex -space-x-2">
          {TEAM.map((m) => (
            <Avatar key={m.id} id={m.id} size="sm" className="ring-2 ring-slate-900" />
          ))}
        </div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD MODULE
// ══════════════════════════════════════════════════════════════
function DashboardModule({ tasks, milestones, setMilestones }) {
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const daysLeft = Math.max(0, Math.ceil((PROJECT_DEADLINE - new Date()) / (1000 * 60 * 60 * 24)));

  const status = pct >= 60
    ? { label: 'On Track', emoji: '🟢', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' }
    : pct >= 25
    ? { label: 'At Risk', emoji: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' }
    : { label: 'Critical', emoji: '🔴', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };

  const memberStats = TEAM.map((m) => {
    const assigned = tasks.filter((t) => t.assignees.includes(m.id));
    const done = assigned.filter((t) => t.status === 'done').length;
    return { ...m, assigned: assigned.length, done, pct: assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0 };
  });

  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimPct(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Ico name="target" size={24} className="text-teal-400" />
        <h2 className="text-2xl font-mono font-bold">Project Dashboard</h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Progress Ring */}
        <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-6 ${status.bg} ${status.color}`}>
            <span>{status.emoji}</span> {status.label}
          </div>
          <div className="relative">
            <svg width="180" height="180" className="-rotate-90">
              <circle cx="90" cy="90" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
              <circle
                cx="90" cy="90" r={radius} fill="none"
                stroke="url(#progressGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ - (animPct / 100) * circ}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-mono font-bold text-white">{pct}%</span>
              <span className="text-xs text-slate-400">complete</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6 text-center">
            <div>
              <p className="text-2xl font-mono font-bold text-white">{doneCount}</p>
              <p className="text-xs text-slate-400">Done</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <p className="text-2xl font-mono font-bold text-white">{total - doneCount}</p>
              <p className="text-xs text-slate-400">Remaining</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <p className="text-2xl font-mono font-bold text-amber-400">{daysLeft}</p>
              <p className="text-xs text-slate-400">Days left</p>
            </div>
          </div>
        </div>

        {/* Member Contributions */}
        <div className="col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Ico name="users" size={16} className="text-teal-400" />
            Team Contribution
          </h3>
          <div className="space-y-4">
            {memberStats.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar id={m.id} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200 truncate">{m.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{m.done}/{m.assigned}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${m.pct}%`, transitionDelay: '0.3s' }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300 w-10 text-right">{m.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Ico name="award" size={16} className="text-amber-400" />
            Milestones
          </h3>
          <div className="space-y-3">
            {milestones.map((ms, i) => (
              <button
                key={ms.id}
                onClick={() => setMilestones(milestones.map((m) => m.id === ms.id ? { ...m, done: !m.done } : m))}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left group"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  ms.done ? 'bg-teal-500 border-teal-500' : 'border-slate-600 group-hover:border-slate-400'
                }`}>
                  {ms.done && <Ico name="check" size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors ${ms.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {ms.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{ms.due}</p>
                </div>
                {i < milestones.length - 1 && (
                  <div className="absolute left-[29px] top-[42px] w-0.5 h-4 bg-slate-700" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs text-slate-500 font-medium mb-2">TASK BREAKDOWN</h4>
            {KANBAN_COLS.map((col) => {
              const count = tasks.filter((t) => t.status === col.key).length;
              return (
                <div key={col.key} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                    <span className="text-xs text-slate-400">{col.label}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  CHAT MODULE
// ══════════════════════════════════════════════════════════════
const EMOJI_QUICK = ['👍', '❤️', '🔥', '🚀', '💯', '✅', '😂', '👏', '🎉', '👀'];

function ChatModule({ channels, setChannels }) {
  const [activeCh, setActiveCh] = useState('general');
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const msgEndRef = useRef(null);
  const fileRef = useRef(null);

  const channel = channels.find((c) => c.id === activeCh);
  const messages = channel?.messages || [];

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeCh]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text && !imagePreview) return;
    const newMsg = {
      id: Date.now(),
      sender: 'alex',
      text: imagePreview ? `📷 ${text || 'Shared an image'}` : text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      read: true,
      image: imagePreview || null,
    };
    setChannels(channels.map((c) =>
      c.id === activeCh ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setInput('');
    setImagePreview(null);
  };

  const toggleReaction = (msgId, emoji) => {
    setChannels(channels.map((c) => {
      if (c.id !== activeCh) return c;
      return {
        ...c,
        messages: c.messages.map((m) => {
          if (m.id !== msgId) return m;
          const r = { ...m.reactions };
          if (r[emoji]?.includes('alex')) {
            r[emoji] = r[emoji].filter((u) => u !== 'alex');
            if (r[emoji].length === 0) delete r[emoji];
          } else {
            r[emoji] = [...(r[emoji] || []), 'alex'];
          }
          return { ...m, reactions: r };
        }),
      };
    }));
    setShowEmoji(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const insertMention = (name) => {
    setInput((prev) => prev + `@${name} `);
    setShowMentions(false);
  };

  const renderText = (text) => {
    return text.split(/(@\w+\s?\w?\.?)/g).map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} className="text-teal-400 font-semibold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Channel List */}
      <div className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-mono font-bold text-slate-300 flex items-center gap-2">
            <Ico name="hash" size={16} className="text-teal-400" />
            Channels
          </h2>
        </div>
        <div className="flex-1 p-2 space-y-0.5">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveCh(ch.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                activeCh === ch.id ? 'bg-teal-500/15 text-teal-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm">{ch.icon}</span>
              <span className="text-sm font-medium">{ch.name}</span>
              {ch.messages.some((m) => !m.read) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-teal-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b border-slate-800 flex items-center px-5 gap-2 shrink-0">
          <span className="text-sm">{channel?.icon}</span>
          <span className="font-mono font-bold text-sm">#{channel?.name}</span>
          <span className="text-xs text-slate-500 ml-2">{messages.length} messages</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const m = member(msg.sender);
            return (
              <div key={msg.id} className="group flex gap-3 animate-slide-right">
                <Avatar id={msg.sender} size="md" className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-semibold ${m.text}`}>{m.name}</span>
                    <span className="text-[11px] text-slate-500">{msg.time}</span>
                    {msg.read && <span className="text-[10px] text-slate-600">✓✓</span>}
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{renderText(msg.text)}</p>
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="mt-2 max-w-xs rounded-lg border border-slate-700 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(msg.id, emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                          users.includes('alex')
                            ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="font-mono">{users.length}</span>
                      </button>
                    ))}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmoji(showEmoji === msg.id ? null : msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all"
                      >
                        <Ico name="smile" size={14} />
                      </button>
                      {showEmoji === msg.id && (
                        <div className="absolute bottom-full left-0 mb-1 p-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl flex gap-1 z-10">
                          {EMOJI_QUICK.map((e) => (
                            <button key={e} onClick={() => toggleReaction(msg.id, e)} className="hover:scale-125 transition-transform text-base p-0.5">
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={msgEndRef} />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="px-5 pb-2 flex items-center gap-2">
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-700" />
              <button
                onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              >
                <Ico name="x" size={10} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 focus-within:border-teal-500 transition-colors">
            <button
              onClick={() => fileRef.current?.click()}
              className="text-slate-400 hover:text-teal-400 transition-colors shrink-0"
            >
              <Ico name="clip" size={18} />
            </button>
            <input type="file" ref={fileRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                  if (e.key === '@') setShowMentions(true);
                }}
                placeholder={`Message #${channel?.name}...`}
                className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              {showMentions && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10">
                  {TEAM.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => insertMention(m.name)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
                    >
                      <Avatar id={m.id} size="sm" />
                      <span className="text-sm text-slate-200">{m.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowMentions(!showMentions)}
              className="text-slate-400 hover:text-teal-400 transition-colors shrink-0"
            >
              <span className="text-sm font-bold">@</span>
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim() && !imagePreview}
              className="p-1.5 bg-teal-500 rounded-lg text-white hover:bg-teal-600 disabled:opacity-30 disabled:hover:bg-teal-500 transition-colors shrink-0"
            >
              <Ico name="send" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TASKS MODULE
// ══════════════════════════════════════════════════════════════
function TasksModule({ tasks, setTasks }) {
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = tasks
    .filter((t) => filterAssignee === 'all' || t.assignees.includes(filterAssignee))
    .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
    .filter((t) => filterStatus === 'all' || t.status === filterStatus)
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.due) - new Date(b.due));

  const openEdit = (task) => {
    setEditTask({ ...task });
    setShowForm(true);
  };

  const openNew = () => {
    setEditTask({ id: 0, title: '', desc: '', assignees: [], due: '', priority: 'medium', status: 'todo' });
    setShowForm(true);
  };

  const saveTask = () => {
    if (!editTask || !editTask.title.trim()) return;
    if (editTask.id === 0) {
      setTasks([...tasks, { ...editTask, id: Date.now() }]);
    } else {
      setTasks(tasks.map((t) => (t.id === editTask.id ? editTask : t)));
    }
    setShowForm(false);
    setEditTask(null);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleAssignee = (memberId) => {
    if (!editTask) return;
    const has = editTask.assignees.includes(memberId);
    setEditTask({
      ...editTask,
      assignees: has ? editTask.assignees.filter((a) => a !== memberId) : [...editTask.assignees, memberId],
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ico name="tasks" size={24} className="text-teal-400" />
          <h2 className="text-2xl font-mono font-bold">Tasks</h2>
          <span className="text-sm text-slate-400">({filtered.length})</span>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Ico name="plus" size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Ico name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <Dropdown
          value={filterAssignee}
          onChange={setFilterAssignee}
          options={[{ value: 'all', label: 'All Members' }, ...TEAM.map((m) => ({ value: m.id, label: m.name }))]}
        />
        <Dropdown
          value={filterPriority}
          onChange={setFilterPriority}
          options={[{ value: 'all', label: 'All Priorities' }, ...Object.entries(PRIORITY_CFG).map(([k, v]) => ({ value: k, label: v.label }))]}
        />
        <Dropdown
          value={filterStatus}
          onChange={setFilterStatus}
          options={[{ value: 'all', label: 'All Statuses' }, ...Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
        />
      </div>

      {/* Task Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 font-mono uppercase">
              <th className="text-left px-5 py-3 font-medium">Task</th>
              <th className="text-left px-5 py-3 font-medium w-40">Assignees</th>
              <th className="text-left px-5 py-3 font-medium w-28">Priority</th>
              <th className="text-left px-5 py-3 font-medium w-28">Status</th>
              <th className="text-left px-5 py-3 font-medium w-28">Due Date</th>
              <th className="px-5 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => {
              const isOverdue = new Date(task.due) < new Date() && task.status !== 'done';
              return (
                <tr
                  key={task.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => openEdit(task)}
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-200">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.desc}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex -space-x-1.5">
                      {task.assignees.map((a) => <Avatar key={a} id={a} size="sm" className="ring-2 ring-slate-900" />)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                      task.status === 'inprogress' ? 'bg-teal-500/20 text-teal-400' :
                      task.status === 'review' ? 'bg-amber-500/20 text-amber-400' :
                      task.status === 'todo' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                      {task.due}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Ico name="trash" size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">No tasks match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editTask?.id === 0 ? 'New Task' : 'Edit Task'} wide>
        {editTask && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Title</label>
              <input
                type="text"
                value={editTask.title}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                placeholder="Task title..."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Description</label>
              <textarea
                value={editTask.desc}
                onChange={(e) => setEditTask({ ...editTask, desc: e.target.value })}
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500 resize-none"
                placeholder="Task description..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Dropdown
                label="Priority"
                value={editTask.priority}
                onChange={(v) => setEditTask({ ...editTask, priority: v })}
                options={Object.entries(PRIORITY_CFG).map(([k, v]) => ({ value: k, label: v.label }))}
              />
              <Dropdown
                label="Status"
                value={editTask.status}
                onChange={(v) => setEditTask({ ...editTask, status: v })}
                options={Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))}
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Due Date</label>
                <input
                  type="date"
                  value={editTask.due}
                  onChange={(e) => setEditTask({ ...editTask, due: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium">Assignees</label>
              <div className="flex flex-wrap gap-2">
                {TEAM.map((m) => {
                  const selected = editTask.assignees.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleAssignee(m.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                        selected
                          ? 'bg-teal-500/15 border-teal-500/40 text-teal-400'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <Avatar id={m.id} size="sm" />
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                disabled={!editTask.title.trim()}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-colors"
              >
                {editTask.id === 0 ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  KANBAN MODULE
// ══════════════════════════════════════════════════════════════
function KanbanModule({ tasks, setTasks }) {
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  return (
    <div className="p-6 animate-fade-in h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <Ico name="kanban" size={24} className="text-teal-400" />
        <h2 className="text-2xl font-mono font-bold">Board</h2>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-0">
        {KANBAN_COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const isOver = dragOver === col.key;
          return (
            <div
              key={col.key}
              className={`flex flex-col w-72 shrink-0 rounded-2xl transition-colors ${
                isOver ? 'bg-teal-500/5 ring-1 ring-teal-500/30' : 'bg-slate-900/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId != null) {
                  setTasks(tasks.map((t) => (t.id === dragId ? { ...t, status: col.key } : t)));
                }
                setDragId(null);
                setDragOver(null);
              }}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${col.accent}`} />
                <span className="text-sm font-mono font-bold text-slate-300">{col.label}</span>
                <span className="ml-auto text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5">
                {colTasks.map((task) => {
                  const pc = PRIORITY_CFG[task.priority];
                  const isOverdue = new Date(task.due) < new Date() && task.status !== 'done';
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(task.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => { setDragId(null); setDragOver(null); }}
                      className={`bg-slate-800 border border-slate-700 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-slate-600 transition-all group border-l-[3px] ${pc.border} ${
                        dragId === task.id ? 'opacity-40 scale-95' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-200 leading-snug">{task.title}</p>
                        <Ico name="grip" size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex -space-x-1.5">
                          {task.assignees.map((a) => (
                            <Avatar key={a} id={a} size="sm" className="ring-2 ring-slate-800" />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 mt-2.5 text-[11px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                        <Ico name="calendar" size={12} />
                        <span className="font-mono">{task.due}</span>
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <div className="py-8 text-center text-slate-600 text-xs">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  FILES MODULE
// ══════════════════════════════════════════════════════════════
function FilesModule({ files, setFiles, recordings }) {
  const [filterTag, setFilterTag] = useState('all');
  const [filterUploader, setFilterUploader] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const allTags = [...new Set(files.flatMap((f) => f.tags))];

  const filtered = files
    .filter((f) => filterTag === 'all' || f.tags.includes(filterTag))
    .filter((f) => filterUploader === 'all' || f.uploader === filterUploader);

  const handleUpload = (fileList) => {
    Array.from(fileList).forEach((file) => {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        uploader: 'alex',
        tags: [],
        at: new Date().toISOString().slice(0, 10),
        size: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
        blob: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      };
      setFiles((prev) => [...prev, newFile]);
    });
  };

  const deleteFile = (id) => setFiles(files.filter((f) => f.id !== id));

  const fileIcon = (f) => {
    if (f.type === 'image') return 'image';
    if (f.type === 'audio') return 'mic';
    return 'files';
  };

  const fileColor = (f) => {
    if (f.type === 'image') return 'bg-violet-500/20 text-violet-400';
    if (f.type === 'audio') return 'bg-red-500/20 text-red-400';
    const ext = f.name.split('.').pop();
    if (['csv', 'xlsx'].includes(ext)) return 'bg-green-500/20 text-green-400';
    if (['pdf'].includes(ext)) return 'bg-red-500/20 text-red-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ico name="files" size={24} className="text-teal-400" />
          <h2 className="text-2xl font-mono font-bold">Files</h2>
          <span className="text-sm text-slate-400">({filtered.length})</span>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Ico name="upload" size={16} /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <Dropdown
          value={filterUploader}
          onChange={setFilterUploader}
          options={[{ value: 'all', label: 'All Uploaders' }, ...TEAM.map((m) => ({ value: m.id, label: m.name }))]}
        />
        <Dropdown
          value={filterTag}
          onChange={setFilterTag}
          options={[{ value: 'all', label: 'All Tags' }, ...allTags.map((t) => ({ value: t, label: t }))]}
        />
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-colors ${
          dragActive
            ? 'border-teal-500 bg-teal-500/5'
            : 'border-slate-700 hover:border-slate-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
        }}
      >
        <Ico name="upload" size={32} className={`mx-auto mb-3 ${dragActive ? 'text-teal-400' : 'text-slate-600'}`} />
        <p className="text-sm text-slate-400">Drag and drop files here, or click Upload</p>
        <p className="text-xs text-slate-600 mt-1">Images, documents, spreadsheets, etc.</p>
      </div>

      {/* Recordings */}
      {recordings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-mono font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Ico name="mic" size={16} className="text-red-400" />
            Recordings
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {recordings.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                  <Ico name="mic" size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.duration} • {r.size}</p>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-colors">
                  <Ico name="download" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition-colors"
          >
            {file.type === 'image' ? (
              <div className="h-36 bg-slate-800 flex items-center justify-center overflow-hidden">
                {file.blob ? (
                  <img src={file.blob} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Ico name="image" size={32} className="text-slate-600" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-36 bg-slate-800 flex items-center justify-center">
                <div className={`w-14 h-14 rounded-2xl ${fileColor(file)} flex items-center justify-center`}>
                  <Ico name={fileIcon(file)} size={24} />
                </div>
              </div>
            )}
            <div className="p-4">
              <p className="text-sm font-medium text-slate-200 truncate mb-1">{file.name}</p>
              <div className="flex items-center gap-2 mb-2">
                <Avatar id={file.uploader} size="sm" />
                <span className="text-xs text-slate-400">{member(file.uploader).name}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {file.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded-full text-[10px] text-slate-400">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{file.size}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-slate-800 hover:text-teal-400 transition-colors" title="Download">
                    <Ico name="download" size={13} />
                  </button>
                  <button className="p-1 rounded hover:bg-slate-800 hover:text-teal-400 transition-colors" title="Copy link">
                    <Ico name="link" size={13} />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Ico name="trash" size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 py-16 text-center text-slate-500 text-sm">No files match your filters.</div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [channels, setChannels] = useState(SEED_CHANNELS);
  const [milestones, setMilestones] = useState(SEED_MILESTONES);
  const [files, setFiles] = useState(SEED_FILES);
  const [recordings, setRecordings] = useState([]);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recInterval = useRef(null);

  useEffect(() => {
    if (isRecording) {
      recInterval.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      clearInterval(recInterval.current);
    }
    return () => clearInterval(recInterval.current);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      setRecordings((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: `recording-${new Date().toISOString().slice(0, 16).replace('T', '-')}.wav`,
          type: 'audio',
          duration: fmtTime(recordingTime),
          size: `${Math.round(recordingTime * 16)} KB`,
          uploader: 'alex',
          tags: ['recording'],
          at: new Date().toISOString().slice(0, 10),
        },
      ]);
      setRecordingTime(0);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar active={activeTab} onNav={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          isRecording={isRecording}
          recordingTime={recordingTime}
          onToggleRecording={toggleRecording}
        />
        <main className="flex-1 overflow-hidden">
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <DashboardModule tasks={tasks} milestones={milestones} setMilestones={setMilestones} />
            </div>
          )}
          {activeTab === 'chat' && (
            <ChatModule channels={channels} setChannels={setChannels} />
          )}
          {activeTab === 'tasks' && (
            <div className="h-full overflow-y-auto">
              <TasksModule tasks={tasks} setTasks={setTasks} />
            </div>
          )}
          {activeTab === 'kanban' && (
            <KanbanModule tasks={tasks} setTasks={setTasks} />
          )}
          {activeTab === 'files' && (
            <div className="h-full overflow-y-auto">
              <FilesModule files={files} setFiles={setFiles} recordings={recordings} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
