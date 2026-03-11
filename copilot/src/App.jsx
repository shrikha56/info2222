/* global React */
const { useEffect, useMemo, useReducer, useRef, useState } = React;

/** ---------------------------------------------------------
 * Utilities
 * --------------------------------------------------------*/
const uid = () => Math.random().toString(36).slice(2, 9);

const formatDate = (d) => {
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const daysUntil = (d) => {
  const now = new Date();
  const end = (d instanceof Date) ? d : new Date(d);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

const classNames = (...xs) => xs.filter(Boolean).join(' ');

const priorityColor = (p) => ({
  Low: 'bg-priority-low/20 text-sky-300 ring-sky-400/30',
  Medium: 'bg-priority-medium/20 text-green-300 ring-green-400/30',
  High: 'bg-priority-high/20 text-amber-300 ring-amber-400/30',
  Critical: 'bg-priority-critical/20 text-red-300 ring-red-400/30',
}[p] || 'bg-slate-700 text-slate-200');

const statusColumns = [
  { key: 'Backlog', label: 'Backlog' },
  { key: 'To Do', label: 'To Do' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Review', label: 'Review' },
  { key: 'Done', label: 'Done' },
];

/** ---------------------------------------------------------
 * Seed Data (in-memory state)
 * --------------------------------------------------------*/
const seedTeam = [
  { id: 'u1', name: 'Alex T.', initials: 'AT', color: '#22c55e' },
  { id: 'u2', name: 'Priya M.', initials: 'PM', color: '#38bdf8' },
  { id: 'u3', name: 'Jordan K.', initials: 'JK', color: '#f59e0b' },
  { id: 'u4', name: 'Sam L.', initials: 'SL', color: '#ef4444' },
  { id: 'u5', name: 'Wei C.', initials: 'WC', color: '#a78bfa' },
];

const now = new Date();
const projectSeed = {
  name: 'Smart Campus Sustainability App',
  dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18, 17, 0, 0),
  milestones: [
    { id: 'm1', title: 'Research complete', done: true },
    { id: 'm2', title: 'Prototype built', done: false },
    { id: 'm3', title: 'Final submission', done: false },
  ],
};

const seedTasks = [
  { id: uid(), title: 'Define MVP scope', description: 'Outline core features for v1.', assignees: ['u1','u2'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+4), priority: 'High', status: 'To Do' },
  { id: uid(), title: 'Map campus API data', description: 'Integrate energy usage dataset.', assignees: ['u5'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+7), priority: 'Critical', status: 'In Progress' },
  { id: uid(), title: 'Build auth screen', description: 'SSO mock for demo.', assignees: ['u3'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+3), priority: 'Medium', status: 'To Do' },
  { id: uid(), title: 'Design dashboard UI', description: 'Wireframes & visual pass.', assignees: ['u2','u3'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+5), priority: 'High', status: 'In Progress' },
  { id: uid(), title: 'Accessibility audit', description: 'WCAG AA checks.', assignees: ['u4'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+9), priority: 'Low', status: 'Backlog' },
  { id: uid(), title: 'Notifications module', description: 'Event-based toasts.', assignees: ['u1','u5'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+10), priority: 'Medium', status: 'Backlog' },
  { id: uid(), title: 'Unit tests setup', description: 'Baseline harness.', assignees: ['u3','u4'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+6), priority: 'High', status: 'Review' },
  { id: uid(), title: 'Pitch deck slides', description: 'For presentation prep.', assignees: ['u2'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+2), priority: 'Critical', status: 'To Do' },
  { id: uid(), title: 'Deploy demo build', description: 'Netlify / Vercel demo.', assignees: ['u1'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+12), priority: 'Medium', status: 'Backlog' },
  { id: uid(), title: 'Bug triage pass', description: 'Collect and prioritize bugs.', assignees: ['u5','u4'], due: new Date(now.getFullYear(), now.getMonth(), now.getDate()+11), priority: 'High', status: 'Done' },
];

const seedChannels = [
  {
    id: 'c1',
    name: '#general',
    messages: [
      { id: uid(), user: 'u2', text: "Welcome to Stackd! Let's keep updates here. @Alex take a look at the dashboard wire.", time: new Date(now - 1000*60*60*14), reactions: { '👍': ['u1','u3'], '🔥': ['u5'] }, seenBy: ['u1','u3','u4','u5'], images: [], thread: [] },
      { id: uid(), user: 'u1', text: "On it! Uploading the figma snapshot.", time: new Date(now - 1000*60*60*13), reactions: {}, seenBy: ['u2','u3','u4'], images: [], thread: [
        { id: uid(), user: 'u3', text: 'I can review typography pass later today.', time: new Date(now - 1000*60*60*12) }
      ] },
    ],
  },
  {
    id: 'c2',
    name: '#dev-chat',
    messages: [
      { id: uid(), user: 'u5', text: 'Campus energy API auth key mocked. Data contract in /docs.', time: new Date(now - 1000*60*60*6), reactions: { '⚡': ['u2'] }, seenBy: ['u1','u2','u3'], images: [], thread: [] },
    ],
  },
  {
    id: 'c3',
    name: '#presentation-prep',
    messages: [
      { id: uid(), user: 'u2', text: 'Slides skeleton up. Need final metrics visuals.', time: new Date(now - 1000*60*60*2), reactions: { '🖼️': ['u1'] }, seenBy: ['u1','u5'], images: [], thread: [] },
    ],
  },
];

/** ---------------------------------------------------------
 * Small UI atoms
 * --------------------------------------------------------*/
const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path d={path} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const icons = {
  chat: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z",
  tasks: "M9 7h10M9 12h10M9 17h10M5 7h.01M5 12h.01M5 17h.01",
  kanban: "M4 5h6v14H4zM14 5h6v8h-6zM14 15h6v4h-6z",
  success: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2 10 2 2 4-4",
  video: "M15 10l6-3v10l-6-3v6H3V4h12v6z",
  media: "M4 6h16v12H4zM8 10l3 4 2-3 3 4",
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4Z",
  mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Zm7 9a7 7 0 0 1-14 0M12 19v3",
  cam: "M15 10l6-3v10l-6-3v6H3V4h12v6z",
  hand: "M7 13V9a2 2 0 1 1 4 0v4-6a2 2 0 1 1 4 0v6m0-4a2 2 0 1 1 4 0v4a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-2",
  share: "M4 12v7a1 1 0 0 0 1 1h14M16 6l4 4-4 4M20 10H8",
  stop: "M6 6h12v12H6z",
  rec: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  download: "M12 3v12m0 0 4-4m-4 4-4-4M5 21h14",
  delete: "M19 7l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7m14 0H5m3 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  link: "M10 13a5 5 0 0 1 7 0l1 1a5 5 0 0 1 0 7l-3 3M14 11a5 5 0 0 0-7 0l-1 1a5 5 0 0 0 0 7l3 3",
  edit: "M3 21l3-1 11-11-2-2L4 18 3 21zM17 7l2 2",
  close: "M6 6l12 12M6 18L18 6",
  pip: "M4 5h16v5H4zM14 15h6v4h-6z",
};

const Avatar = ({ user, size = 8, ring = true }) => (
  <div
    className={classNames(
      'flex items-center justify-center rounded-full text-xs font-semibold',
      ring && 'ring-2 ring-ink-900',
    )}
    style={{
      width: size * 4,
      height: size * 4,
      background: `${user?.color || '#64748b'}22`,
      color: user?.color || '#e5e7eb',
      fontFamily: '"DM Mono", monospace',
    }}
    title={user?.name}
  >
    {user?.initials || '??'}
  </div>
);

const Pill = ({ children, className }) => (
  <span className={classNames('px-2 py-0.5 rounded-full text-xs font-semibold ring-1', className)}>
    {children}
  </span>
);

/** ---------------------------------------------------------
 * Global App
 * --------------------------------------------------------*/
function App() {
  // Global state
  const [team] = useState(seedTeam);
  const [project, setProject] = useState(projectSeed);
  const [currentUserId] = useState('u1'); // Alex as current
  const [channels, setChannels] = useState(seedChannels);
  const [tasks, setTasks] = useState(seedTasks);
  const [activeTab, setActiveTab] = useState('chat'); // chat, tasks, kanban, success, video, media
  const [activeChannelId, setActiveChannelId] = useState(channels[0].id);
  const [recordings, setRecordings] = useState([]);

  // Derived
  const currentUser = team.find(t => t.id === currentUserId);

  // Sidebar items
  const nav = [
    { key: 'chat', label: 'Group Chat', icon: icons.chat },
    { key: 'tasks', label: 'Tasks', icon: icons.tasks },
    { key: 'kanban', label: 'Kanban', icon: icons.kanban },
    { key: 'success', label: 'Success Meter', icon: icons.success },
    { key: 'video', label: 'Video Call', icon: icons.video },
    { key: 'media', label: 'Media Hub', icon: icons.media },
  ];

  // Topbar countdown ticker
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const daysLeft = daysUntil(project.dueDate);

  // Shared task operations (Tasks panel & Kanban)
  const upsertTask = (t) => {
    setTasks(prev => {
      const exists = prev.some(x => x.id === t.id);
      return exists ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev];
    });
  };
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // Shared chat mutations
  const addMessage = (channelId, msg) => {
    setChannels(prev => prev.map(c => {
      if (c.id !== channelId) return c;
      return {
        ...c,
        messages: [...c.messages, msg],
      };
    }));
  };
  const mutateChannel = (channelId, fn) => {
    setChannels(prev => prev.map(c => (c.id === channelId ? fn(c) : c)));
  };

  const onStopRecording = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const rec = { id: uid(), url, name: filename, createdAt: new Date() };
    setRecordings(prev => [rec, ...prev]);
  };

  const ctx = {
    team, currentUser, project, setProject,
    channels, setChannels, activeChannelId, setActiveChannelId,
    tasks, setTasks, upsertTask, deleteTask,
    recordings, onStopRecording,
  };

  return (
    <div className="h-full flex">
      <Sidebar nav={nav} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar project={project} team={team} daysLeft={daysLeft} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-ink-800/40">
          {activeTab === 'chat' && (
            <ChatPanel {...ctx} />
          )}
          {activeTab === 'tasks' && (
            <TasksPanel {...ctx} />
          )}
          {activeTab === 'kanban' && (
            <KanbanBoard {...ctx} />
          )}
          {activeTab === 'success' && (
            <SuccessMeter {...ctx} />
          )}
          {activeTab === 'video' && (
            <VideoCallPanel {...ctx} />
          )}
          {activeTab === 'media' && (
            <MediaHub {...ctx} />
          )}
        </main>
        <Footer recordings={recordings} />
      </div>
    </div>
  );
}

/** ---------------------------------------------------------
 * Layout
 * --------------------------------------------------------*/
function Sidebar({ nav, activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-ink-800 border-r border-white/5 flex flex-col">
      <div className="h-16 flex items-center px-4 border-b border-white/5">
        <div className="text-xl font-bold tracking-wide" style={{ fontFamily: '"DM Mono", monospace' }}>
          <span className="text-tealx-400">Stackd</span>
          <span className="text-slate-300">.edu</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(item => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={classNames(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md transition',
                active ? 'bg-ink-700 text-tealx-300 ring-1 ring-tealx-400/20' : 'hover:bg-ink-700/60 text-slate-300'
              )}
            >
              <Icon path={item.icon} className="w-5 h-5" />
              <span className="text-sm font-semibold" style={{ fontFamily: '"DM Mono", monospace' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-slate-400 border-t border-white/5">
        <div>Dark-mode first</div>
        <div className="text-slate-500 mt-1">“NASA mission control meets study room”</div>
      </div>
    </aside>
  );
}

function Topbar({ project, team, daysLeft }) {
  return (
    <header className="h-16 bg-ink-800/60 backdrop-blur border-b border-white/5 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="text-tealx-400 font-semibold" style={{ fontFamily: '"DM Mono", monospace' }}>
          {project.name}
        </div>
        <Pill className="bg-amberx-500/20 text-amberx-300 ring-amberx-400/30">
          Due in {daysLeft} day{daysLeft === 1 ? '' : 's'}
        </Pill>
      </div>
      <div className="flex items-center gap-2">
        {team.map(u => <Avatar key={u.id} user={u} size={7} />)}
      </div>
    </header>
  );
}

function Footer({ recordings }) {
  return (
    <footer className="h-12 border-t border-white/5 bg-ink-800/60 flex items-center px-4 justify-between">
      <div className="text-xs text-slate-400">All data is mock & in-memory. No backend.</div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Recordings:</span>
        <div className="flex gap-2 overflow-auto">
          {recordings.map(r => (
            <a
              key={r.id}
              href={r.url}
              download={r.name}
              className="text-xs px-2 py-0.5 rounded bg-ink-700 hover:bg-ink-700/80 text-slate-200 ring-1 ring-white/5"
              title={formatDate(r.createdAt)}
            >
              {r.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/** ---------------------------------------------------------
 * 1) Group Chat
 * --------------------------------------------------------*/
function ChatPanel({ team, currentUser, channels, setChannels, activeChannelId, setActiveChannelId }) {
  const [message, setMessage] = useState('');
  const [uploadImages, setUploadImages] = useState([]);
  const [lightbox, setLightbox] = useState(null); // { url, alt }

  const channel = channels.find(c => c.id === activeChannelId) || channels[0];

  const onSend = () => {
    if (!message.trim() && uploadImages.length === 0) return;
    const msg = {
      id: uid(),
      user: currentUser.id,
      text: message,
      time: new Date(),
      reactions: {},
      seenBy: [], // visual only
      images: uploadImages.map(x => x.url),
      thread: [],
    };
    setChannels(prev => prev.map(c => c.id === channel.id ? ({ ...c, messages: [...c.messages, msg] }) : c));
    setMessage('');
    setUploadImages([]);
  };

  const onImagePick = (files) => {
    const arr = Array.from(files || []).slice(0, 4).map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setUploadImages(prev => [...prev, ...arr]);
  };

  const toggleReaction = (msgId, emoji) => {
    setChannels(prev => prev.map(c => {
      if (c.id !== channel.id) return c;
      const messages = c.messages.map(m => {
        if (m.id !== msgId) return m;
        const list = m.reactions[emoji] || [];
        const has = list.includes(currentUser.id);
        const next = has ? list.filter(x => x !== currentUser.id) : [...list, currentUser.id];
        return { ...m, reactions: { ...m.reactions, [emoji]: next } };
      });
      return { ...c, messages };
    }));
  };

  const addThreadReply = (msgId, text) => {
    setChannels(prev => prev.map(c => {
      if (c.id !== channel.id) return c;
      const messages = c.messages.map(m => {
        if (m.id !== msgId) return m;
        const reply = { id: uid(), user: currentUser.id, text, time: new Date() };
        return { ...m, thread: [...m.thread, reply] };
      });
      return { ...c, messages };
    }));
  };

  const emojis = ['👍','❤️','🔥','🎉','✅','⚡'];
  const [threadOpen, setThreadOpen] = useState(null); // msgId

  return (
    <div className="grid grid-cols-12 gap-6 animate-[fadein_300ms_ease-out]">
      <div className="col-span-3 bg-ink-800/60 rounded-xl border border-white/5 overflow-hidden">
        <div className="p-3 border-b border-white/5 flex items-center gap-2">
          <Icon path={icons.search} />
          <input
            placeholder="Search channels..."
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-500"
          />
        </div>
        <div className="p-2">
          {channels.map(c => {
            const active = c.id === channel.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveChannelId(c.id)}
                className={classNames(
                  'w-full text-left px-3 py-2 rounded-lg transition',
                  active ? 'bg-ink-700 text-tealx-300 ring-1 ring-tealx-400/20' : 'hover:bg-ink-700/50'
                )}
              >
                <div className="font-semibold" style={{ fontFamily: '"DM Mono", monospace' }}>{c.name}</div>
                <div className="text-xs text-slate-400">{c.messages.length} messages</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="col-span-9 bg-ink-800/60 rounded-xl border border-white/5 flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between">
          <div className="font-semibold text-tealx-300" style={{ fontFamily: '"DM Mono", monospace' }}>{channel.name}</div>
          <div className="text-xs text-slate-400">{channel.messages.length} messages</div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {channel.messages.map(m => {
            const user = team.find(u => u.id === m.user) || {};
            const seen = m.seenBy?.length || 0;
            return (
              <div key={m.id} className="flex gap-3">
                <Avatar user={user} size={8} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-slate-400">{formatDate(m.time)}</div>
                    {seen > 0 && (
                      <div className="text-[10px] text-slate-400">Seen by {seen}</div>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">
                    <Mentions text={m.text} team={team} />
                  </div>

                  {/* Inline images */}
                  {m.images?.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {m.images.map((url, idx) => (
                        <button key={idx} onClick={() => setLightbox({ url, alt: 'Image' })}>
                          <img src={url} className="rounded-md ring-1 ring-white/10 hover:ring-white/20 transition" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="mt-2 flex items-center gap-2">
                    {emojis.map(e => {
                      const count = (m.reactions[e] || []).length;
                      const mine = (m.reactions[e] || []).includes(currentUser.id);
                      return (
                        <button
                          key={e}
                          onClick={() => toggleReaction(m.id, e)}
                          className={classNames(
                            'px-2 py-0.5 rounded-full text-xs ring-1 transition',
                            mine ? 'bg-tealx-500/20 ring-tealx-500/30' : 'hover:bg-ink-700 ring-white/10'
                          )}
                        >
                          {e} {count > 0 ? count : ''}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setThreadOpen(threadOpen === m.id ? null : m.id)}
                      className="ml-2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {m.thread.length} replies
                    </button>
                  </div>

                  {/* Thread */}
                  {threadOpen === m.id && (
                    <ThreadBox
                      message={m}
                      team={team}
                      onReply={(t) => addThreadReply(m.id, t)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Composer */}
        <div className="border-t border-white/5 p-3">
          {/* image previews */}
          {uploadImages.length > 0 && (
            <div className="mb-2 flex gap-2">
              {uploadImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.url} className="w-16 h-16 object-cover rounded ring-1 ring-white/10" />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="px-3 py-2 bg-ink-700 hover:bg-ink-700/70 rounded-md cursor-pointer ring-1 ring-white/10 text-sm">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={(e) => onImagePick(e.target.files)}
              />
            </label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message #channel — use @mentions"
              className="flex-1 bg-ink-700/60 px-3 py-2 rounded-md outline-none ring-1 ring-white/10 focus:ring-tealx-400/30"
            />
            <button
              onClick={onSend}
              className="px-3 py-2 rounded-md bg-tealx-500/20 hover:bg-tealx-500/30 text-tealx-300 ring-1 ring-tealx-400/30 flex items-center gap-2"
            >
              <Icon path={icons.send} className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded bg-white/10 hover:bg-white/20"
          >
            <Icon path={icons.close} />
          </button>
          <img src={lightbox.url} alt={lightbox.alt} className="max-h-[80vh] max-w-[90vw] rounded-lg ring-1 ring-white/10" />
        </div>
      )}
    </div>
  );
}

function Mentions({ text, team }) {
  if (!text) return null;
  const parts = text.split(/(\s+)/).map((token, i) => {
    if (token.startsWith('@')) {
      const name = token.slice(1).replace(/[^\w.]/g, '');
      const match = team.find(t => t.name.toLowerCase().startsWith(name.toLowerCase()));
      return (
        <span key={i} className="text-tealx-300">
          @{match ? match.name : name}
        </span>
      );
    }
    return <span key={i}>{token}</span>;
  });
  return <>{parts}</>;
}

function ThreadBox({ message, team, onReply }) {
  const [txt, setTxt] = useState('');
  return (
    <div className="mt-2 ml-1 p-2 border-l-2 border-ink-600 space-y-2">
      {message.thread.map(r => {
        const user = team.find(u => u.id === r.user) || {};
        return (
          <div key={r.id} className="flex items-start gap-2">
            <Avatar user={user} size={6} />
            <div>
              <div className="text-xs text-slate-400">{formatDate(r.time)}</div>
              <div>{r.text}</div>
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2">
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          placeholder="Reply in thread…"
          className="flex-1 bg-ink-700/60 px-3 py-2 rounded-md outline-none ring-1 ring-white/10 focus:ring-tealx-400/30"
        />
        <button
          onClick={() => { if (txt.trim()) { onReply(txt.trim()); setTxt(''); }}}
          className="text-xs px-3 py-2 rounded bg-ink-700 hover:bg-ink-700/70 ring-1 ring-white/10"
        >
          Reply
        </button>
      </div>
    </div>
  );
}

/** ---------------------------------------------------------
 * 2) Task Assignment (feeds Kanban)
 * --------------------------------------------------------*/
function TasksPanel({ team, tasks, upsertTask, deleteTask }) {
  const [filter, setFilter] = useState({ assignee: 'all', priority: 'all', sort: 'dueAsc' });
  const [editing, setEditing] = useState(null); // task or null
  const [query, setQuery] = useState('');

  const filtered = tasks
    .filter(t => filter.assignee === 'all' || t.assignees.includes(filter.assignee))
    .filter(t => filter.priority === 'all' || t.priority === filter.priority)
    .filter(t => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (filter.sort === 'dueAsc') return new Date(a.due) - new Date(b.due);
      if (filter.sort === 'dueDesc') return new Date(b.due) - new Date(a.due);
      const prioOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      if (filter.sort === 'prioDesc') return prioOrder[b.priority] - prioOrder[a.priority];
      return 0;
    });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setEditing({ id: uid(), title: '', description: '', assignees: [], due: new Date(), priority: 'Low', status: 'Backlog' })}
          className="px-3 py-2 rounded-md bg-tealx-500/20 text-tealx-300 ring-1 ring-tealx-400/30 flex items-center gap-2"
        >
          <Icon path={icons.plus} className="w-4 h-4" /> New Task
        </button>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="bg-ink-700/60 px-3 py-2 rounded-md outline-none ring-1 ring-white/10"
          />
          <select
            className="bg-ink-700/60 px-2 py-2 rounded-md outline-none ring-1 ring-white/10"
            value={filter.assignee}
            onChange={(e) => setFilter(f => ({ ...f, assignee: e.target.value }))}
          >
            <option value="all">All assignees</option>
            {team.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select
            className="bg-ink-700/60 px-2 py-2 rounded-md outline-none ring-1 ring-white/10"
            value={filter.priority}
            onChange={(e) => setFilter(f => ({ ...f, priority: e.target.value }))}
          >
            <option value="all">All priorities</option>
            {['Low','Medium','High','Critical'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            className="bg-ink-700/60 px-2 py-2 rounded-md outline-none ring-1 ring-white/10"
            value={filter.sort}
            onChange={(e) => setFilter(f => ({ ...f, sort: e.target.value }))}
          >
            <option value="dueAsc">Due date ↑</option>
            <option value="dueDesc">Due date ↓</option>
            <option value="prioDesc">Priority ↓</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="p-4 rounded-xl bg-ink-800/60 ring-1 ring-white/5 space-y-3">
            <div className="flex justify-between">
              <div className="font-semibold">{t.title}</div>
              <div className="flex items-center gap-2">
                <Pill className={priorityColor(t.priority)}>{t.priority}</Pill>
                <Pill className="bg-ink-700/60 text-slate-300 ring-white/10">{t.status}</Pill>
              </div>
            </div>
            <div className="text-sm text-slate-300">{t.description}</div>
            <div className="flex items-center gap-2">
              {t.assignees.map(id => <Avatar key={id} user={team.find(u => u.id === id)} size={6} />)}
              <div className="text-xs text-slate-400 ml-auto">Due {formatDate(t.due)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(t)} className="text-xs px-2 py-1 rounded ring-1 ring-white/10 bg-ink-700 hover:bg-ink-700/70 flex items-center gap-1">
                <Icon path={icons.edit} className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => deleteTask(t.id)} className="text-xs px-2 py-1 rounded ring-1 ring-red-500/30 text-red-300 bg-red-500/10 hover:bg-red-500/20 flex items-center gap-1">
                <Icon path={icons.delete} className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <TaskEditor
          team={team}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(task) => { upsertTask(task); setEditing(null); }}
        />
      )}
    </div>
  );
}

function TaskEditor({ team, initial, onClose, onSave }) {
  const [task, setTask] = useState({ ...initial });
  const toggleAssignee = (id) => {
    setTask(t => t.assignees.includes(id)
      ? { ...t, assignees: t.assignees.filter(x => x !== id) }
      : { ...t, assignees: [...t.assignees, id] }
    );
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-full max-w-xl bg-ink-800 rounded-xl ring-1 ring-white/10 p-4 space-y-3 animate-[slidein_200ms_ease-out]">
        <div className="flex justify-between items-center">
          <div className="text-tealx-300 font-semibold" style={{ fontFamily: '"DM Mono", monospace' }}>
            {initial?.title ? 'Edit Task' : 'New Task'}
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-ink-700">
            <Icon path={icons.close} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-slate-400">Title</label>
            <input
              value={task.title}
              onChange={(e) => setTask(t => ({ ...t, title: e.target.value }))}
              className="mt-1 w-full bg-ink-700/60 px-3 py-2 rounded ring-1 ring-white/10 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400">Description</label>
            <textarea
              value={task.description}
              onChange={(e) => setTask(t => ({ ...t, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full bg-ink-700/60 px-3 py-2 rounded ring-1 ring-white/10 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Priority</label>
            <select
              value={task.priority}
              onChange={(e) => setTask(t => ({ ...t, priority: e.target.value }))}
              className="mt-1 w-full bg-ink-700/60 px-3 py-2 rounded ring-1 ring-white/10 outline-none"
            >
              {['Low','Medium','High','Critical'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Status</label>
            <select
              value={task.status}
              onChange={(e) => setTask(t => ({ ...t, status: e.target.value }))}
              className="mt-1 w-full bg-ink-700/60 px-3 py-2 rounded ring-1 ring-white/10 outline-none"
            >
              {statusColumns.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Due Date</label>
            <input
              type="date"
              value={new Date(task.due).toISOString().slice(0,10)}
              onChange={(e) => setTask(t => ({ ...t, due: new Date(e.target.value) }))}
              className="mt-1 w-full bg-ink-700/60 px-3 py-2 rounded ring-1 ring-white/10 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400">Assignees</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {team.map(u => {
                const on = task.assignees.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggleAssignee(u.id)}
                    className={classNames(
                      'px-3 py-1 rounded ring-1 transition flex items-center gap-2',
                      on ? 'bg-tealx-500/20 ring-tealx-400/30' : 'bg-ink-700/60 ring-white/10 hover:bg-ink-700'
                    )}
                  >
                    <Avatar user={u} size={5} />
                    <span className="text-sm">{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded bg-ink-700 ring-1 ring-white/10">Cancel</button>
          <button
            onClick={() => onSave(task)}
            className="px-3 py-2 rounded bg-tealx-500/20 ring-1 ring-tealx-400/30 text-tealx-300"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}

/** ---------------------------------------------------------
 * 3) Kanban Board (Drag & Drop)
 * --------------------------------------------------------*/
function KanbanBoard({ team, tasks, upsertTask, deleteTask }) {
  const [drag, setDrag] = useState(null); // taskId

  const onDropCard = (statusKey) => {
    if (!drag) return;
    const t = tasks.find(x => x.id === drag);
    if (!t) return;
    upsertTask({ ...t, status: statusKey });
    setDrag(null);
  };

  const columnTasks = (key) => tasks.filter(t => t.status === key);

  return (
    <div className="grid grid-cols-5 gap-4">
      {statusColumns.map(col => (
        <div
          key={col.key}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDropCard(col.key)}
          className="rounded-xl bg-ink-800/60 ring-1 ring-white/5 p-3 flex flex-col min-h-[60vh]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold" style={{ fontFamily: '"DM Mono", monospace' }}>
              {col.label}
            </div>
            <Pill className="bg-ink-700/60 text-slate-300 ring-white/10">{columnTasks(col.key).length}</Pill>
          </div>
          <div className="space-y-3 flex-1">
            {columnTasks(col.key).map(t => (
              <div
                key={t.id}
                draggable
                onDragStart={() => setDrag(t.id)}
                className="p-3 rounded-lg bg-ink-700/60 ring-1 ring-white/10 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-tealx-500/10 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="font-semibold">{t.title}</div>
                  <Pill className={priorityColor(t.priority)}>{t.priority}</Pill>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {t.assignees.map(id => <Avatar key={id} user={team.find(u => u.id === id)} size={5} />)}
                  <div className="ml-auto text-[11px] text-slate-400">Due {new Date(t.due).toLocaleDateString()}</div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => upsertTask({ ...t, title: t.title + ' •' })}
                    className="text-[11px] px-2 py-1 rounded bg-ink-800 hover:bg-ink-800/80 ring-1 ring-white/10"
                  >
                    Quick Edit
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-[11px] px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 ring-1 ring-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** ---------------------------------------------------------
 * 4) Project Success Meter (Charts via SVG)
 * --------------------------------------------------------*/
function SuccessMeter({ project, setProject, tasks, team }) {
  const total = tasks.length || 1;
  const done = tasks.filter(t => t.status === 'Done').length;
  const pct = Math.round((done / total) * 100);

  const byMember = team.map(u => ({
    user: u,
    score: tasks.filter(t => t.assignees.includes(u.id) && t.status === 'Done').length,
    total: tasks.filter(t => t.assignees.includes(u.id)).length,
  }));

  const daysLeft = daysUntil(project.dueDate);
  const status =
    pct >= 70 && daysLeft >= 7 ? { label: 'On Track 🟢', color: 'text-green-300 bg-green-500/15 ring-green-400/30' } :
    pct >= 40 ? { label: 'At Risk 🟡', color: 'text-amber-300 bg-amber-500/15 ring-amber-400/30' } :
    { label: 'Critical 🔴', color: 'text-red-300 bg-red-500/15 ring-red-400/30' };

  // Progress ring
  const size = 160, stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);

  const toggleMilestone = (id) => {
    setProject(p => ({
      ...p,
      milestones: p.milestones.map(m => m.id === id ? { ...m, done: !m.done } : m),
    }));
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4 p-5 rounded-xl bg-ink-800/60 ring-1 ring-white/5 flex items-center justify-center">
        <div className="relative">
          <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size/2} cy={size/2} r={r} stroke="#1f2a44" strokeWidth={stroke} fill="none" />
            <circle
              cx={size/2} cy={size/2} r={r}
              stroke="url(#grad)"
              strokeWidth={stroke} fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
            <defs>
              <linearGradient id="grad" x1="0" x2="1">
                <stop offset="0%" stopColor="#2ad4c3"/>
                <stop offset="100%" stopColor="#f7b942"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="text-4xl font-bold text-tealx-300" style={{ fontFamily: '"DM Mono", monospace' }}>{pct}%</div>
            <div className="text-sm text-slate-400">Complete</div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8 space-y-4">
        <div className="p-5 rounded-xl bg-ink-800/60 ring-1 ring-white/5">
          <div className="flex items-center gap-3">
            <Pill className={classNames('ring-1', status.color)}>{status.label}</Pill>
            <div className="text-sm text-slate-300">Days remaining: <span className="text-tealx-300">{daysLeft}</span></div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Milestones</div>
              <div className="space-y-2">
                {project.milestones.map(m => (
                  <label key={m.id} className="flex items-center gap-3 p-2 rounded bg-ink-700/50 ring-1 ring-white/10">
                    <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(m.id)} />
                    <span className={classNames('text-sm', m.done ? 'line-through text-slate-400' : '')}>{m.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-2">Per-member contribution</div>
              <div className="space-y-3">
                {byMember.map(({ user, score, total }) => {
                  const perc = total ? Math.round((score/total)*100) : 0;
                  return (
                    <div key={user.id}>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar user={user} size={5} />
                        <div className="text-sm">{user.name}</div>
                        <div className="text-xs text-slate-400 ml-auto">{score}/{total} ({perc}%)</div>
                      </div>
                      <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-tealx-400 to-amberx-400 transition-all duration-700"
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="Total Tasks" value={tasks.length} />
          <StatCard label="Done" value={done} />
          <StatCard label="Open" value={tasks.length - done} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-ink-800/60 ring-1 ring-white/5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-tealx-300 mt-1" style={{ fontFamily: '"DM Mono", monospace' }}>{value}</div>
    </div>
  );
}

/** ---------------------------------------------------------
 * 5) Video Call Panel (Simulated)
 * --------------------------------------------------------*/
function VideoCallPanel({ team, currentUser, onStopRecording }) {
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [hand, setHand] = useState(false);
  const [pip, setPip] = useState(false);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    let id;
    if (recording) {
      id = setInterval(() => setSecs(s => s + 1), 1000);
    }
    return () => id && clearInterval(id);
  }, [recording]);

  const toggleRecording = () => {
    if (!recording) {
      setRecording(true);
      setSecs(0);
    } else {
      setRecording(false);
      // Create a small mock "audio" file
      const data = `Mock audio recording\nDuration: ${secs}s\nTimestamp: ${new Date().toISOString()}\n`;
      const blob = new Blob([data], { type: 'text/plain' });
      onStopRecording(blob, `recording-${new Date().toISOString().replace(/[:.]/g,'-')}.txt`);
    }
  };

  const participants = team; // everyone in
  const cells = pip ? 1 : Math.min(9, participants.length);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className={classNames("bg-ink-800/60 rounded-xl ring-1 ring-white/5 overflow-hidden", pip ? "col-span-8" : "col-span-9")}>
        <div className={classNames("p-3 border-b border-white/5 flex items-center gap-2", recording && "bg-red-500/5")}>
          <button onClick={() => setMuted(m => !m)} className="px-3 py-2 rounded bg-ink-700 hover:bg-ink-700/70 ring-1 ring-white/10 flex items-center gap-2">
            <Icon path={icons.mic} className="w-4 h-4" /> {muted ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={() => setCamOn(c => !c)} className="px-3 py-2 rounded bg-ink-700 hover:bg-ink-700/70 ring-1 ring-white/10 flex items-center gap-2">
            <Icon path={icons.cam} className="w-4 h-4" /> {camOn ? 'Camera Off' : 'Camera On'}
          </button>
          <button onClick={() => setSharing(s => !s)} className="px-3 py-2 rounded bg-ink-700 hover:bg-ink-700/70 ring-1 ring-white/10 flex items-center gap-2">
            <Icon path={icons.share} className="w-4 h-4" /> {sharing ? 'Stop Share' : 'Share Screen'}
          </button>
          <button onClick={() => setHand(h => !h)} className="px-3 py-2 rounded bg-ink-700 hover:bg-ink-700/70 ring-1 ring-white/10 flex items-center gap-2">
            <Icon path={icons.hand} className="w-4 h-4" /> {hand ? 'Lower Hand' : 'Raise Hand'}
          </button>
          <button onClick={() => setPip(p => !p)} className="px-3 py-2 rounded bg-ink-700 hover:bg-ink-700/70 ring-1 ring-white/10 flex items-center gap-2">
            <Icon path={icons.pip} className="w-4 h-4" /> {pip ? 'Exit PiP' : 'PiP'}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleRecording} className={classNames("px-3 py-2 rounded ring-1 flex items-center gap-2",
              recording ? "bg-red-500/20 ring-red-400/30 text-red-300" : "bg-ink-700 hover:bg-ink-700/70 ring-white/10"
            )}>
              <span className={classNames("w-2.5 h-2.5 rounded-full", recording ? "bg-red-400 animate-pulse" : "bg-white/40")} />
              {recording ? `Recording ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}` : 'Record'}
            </button>
            <button className="px-3 py-2 rounded bg-red-500/20 text-red-300 ring-1 ring-red-400/30 flex items-center gap-2">
              <Icon path={icons.stop} className="w-4 h-4" /> End Call
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className={classNames("p-4 grid gap-4",
          cells <= 1 ? "grid-cols-1" :
          cells <= 4 ? "grid-cols-2" :
          "grid-cols-3"
        )}>
          {participants.slice(0, cells).map(p => (
            <div key={p.id} className="aspect-video rounded-xl bg-gradient-to-br from-ink-700 to-ink-600 ring-1 ring-white/10 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <div className="w-20 h-20 rounded-full bg-ink-800 ring-1 ring-white/10 flex items-center justify-center">
                  <span className="text-2xl" style={{ color: p.color }}>{p.initials}</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="px-2 py-1 rounded bg-ink-900/70 text-xs">{p.name}</div>
                {p.id === currentUser.id && hand && (
                  <div className="px-2 py-1 rounded bg-amberx-500/20 text-amberx-300 text-xs ring-1 ring-amberx-400/30">✋ Raised</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div className={classNames("rounded-xl bg-ink-800/60 ring-1 ring-white/5 p-3", pip ? "col-span-4" : "col-span-3")}>
        <div className="font-semibold mb-2" style={{ fontFamily: '"DM Mono", monospace' }}>Participants</div>
        <div className="space-y-2">
          {team.map(u => (
            <div key={u.id} className="flex items-center gap-2 p-2 rounded bg-ink-700/50 ring-1 ring-white/10">
              <Avatar user={u} size={6} />
              <div>
                <div className="text-sm">{u.name}</div>
                <div className="text-xs text-slate-400">{u.id === 'u1' ? 'You' : 'Member'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ---------------------------------------------------------
 * 6) Media Hub (Uploads, tags, filter)
 * --------------------------------------------------------*/
function MediaHub({ team, currentUser }) {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState({ uploader: 'all', tag: '' });

  const onDrop = (e) => {
    e.preventDefault();
    const f = Array.from(e.dataTransfer.files || []);
    addFiles(f);
  };
  const onPick = (e) => addFiles(Array.from(e.target.files || []));

  const addFiles = (arr) => {
    const mapped = arr.map(f => ({
      id: uid(),
      name: f.name,
      url: URL.createObjectURL(f),
      uploader: currentUser?.id || 'u1',
      tags: [],
      type: f.type,
      createdAt: new Date(),
    }));
    setFiles(prev => [...mapped, ...prev]);
  };

  const setTags = (id, tags) => setFiles(prev => prev.map(f => f.id === id ? { ...f, tags } : f));
  const delFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const visible = files.filter(f => (filter.uploader === 'all' || f.uploader === filter.uploader))
    .filter(f => (filter.tag.trim() ? f.tags.some(t => t.toLowerCase().includes(filter.tag.toLowerCase())) : true));

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('Link copied'); } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="px-3 py-2 rounded bg-ink-700 ring-1 ring-white/10 hover:bg-ink-700/70 cursor-pointer">
          Upload Files
          <input type="file" multiple className="hidden" onChange={onPick} />
        </label>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex-1 min-h-[44px] rounded border-2 border-dashed border-tealx-500/30 text-slate-400 flex items-center justify-center"
        >
          Drag & drop files here
        </div>
        <select
          className="bg-ink-700/60 px-2 py-2 rounded-md outline-none ring-1 ring-white/10"
          value={filter.uploader}
          onChange={(e) => setFilter(f => ({ ...f, uploader: e.target.value }))}
        >
          <option value="all">All uploaders</option>
          {team.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <input
          placeholder="Filter by tag…"
          value={filter.tag}
          onChange={(e) => setFilter(f => ({ ...f, tag: e.target.value }))}
          className="bg-ink-700/60 px-3 py-2 rounded-md outline-none ring-1 ring-white/10"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map(file => (
          <div key={file.id} className="p-3 rounded-xl bg-ink-800/60 ring-1 ring-white/5">
            {file.type?.startsWith('image/') ? (
              <img src={file.url} className="aspect-video object-cover rounded ring-1 ring-white/10" />
            ) : (
              <div className="aspect-video rounded bg-ink-700/60 ring-1 ring-white/10 flex items-center justify-center">
                <span className="text-slate-400 text-sm">{file.type || 'file'}</span>
              </div>
            )}
            <div className="mt-3 font-semibold">{file.name}</div>
            <div className="text-xs text-slate-400">Uploaded {formatDate(file.createdAt)}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {file.tags.map((t, i) => <Pill key={i} className="bg-ink-700/60 text-slate-300 ring-white/10">#{t}</Pill>)}
            </div>
            <TagEditor tags={file.tags} onChange={(tags) => setTags(file.id, tags)} />
            <div className="mt-3 flex items-center gap-2">
              <a href={file.url} download={file.name} className="px-2 py-1 rounded bg-ink-700 ring-1 ring-white/10 text-xs flex items-center gap-1 hover:bg-ink-700/70">
                <Icon path={icons.download} className="w-4 h-4" /> Download
              </a>
              <button onClick={() => delFile(file.id)} className="px-2 py-1 rounded bg-red-500/10 text-red-300 ring-1 ring-red-400/30 text-xs flex items-center gap-1 hover:bg-red-500/20">
                <Icon path={icons.delete} className="w-4 h-4" /> Delete
              </button>
              <button onClick={() => copy(file.url)} className="px-2 py-1 rounded bg-ink-700 ring-1 ring-white/10 text-xs flex items-center gap-1 hover:bg-ink-700/70">
                <Icon path={icons.link} className="w-4 h-4" /> Copy link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagEditor({ tags, onChange }) {
  const [value, setValue] = useState('');
  const add = () => {
    const t = value.trim().replace(/^#/, '');
    if (!t) return;
    onChange([...new Set([...tags, t])]);
    setValue('');
  };
  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add tag (e.g. prototype)"
        className="flex-1 bg-ink-700/60 px-3 py-2 rounded-md outline-none ring-1 ring-white/10"
      />
      <button onClick={add} className="px-3 py-2 rounded bg-ink-700 ring-1 ring-white/10 text-xs hover:bg-ink-700/70">Add</button>
    </div>
  );
}