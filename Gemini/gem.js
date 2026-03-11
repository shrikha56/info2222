import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, CheckSquare, Layout, PieChart, Video, 
  FolderOpen, Send, Plus, Paperclip, Mic, MicOff, 
  Video as VideoIcon, VideoOff, PhoneOff, Hand, 
  UploadCloud, Download, Copy, Trash2, Clock 
} from 'lucide-react';

// --- MOCK DATA SEED ---
const TEAM = [
  { id: 't1', name: 'Alex T.', initials: 'AT', color: 'bg-teal-600' },
  { id: 't2', name: 'Priya M.', initials: 'PM', color: 'bg-amber-600' },
  { id: 't3', name: 'Jordan K.', initials: 'JK', color: 'bg-blue-600' },
  { id: 't4', name: 'Sam L.', initials: 'SL', color: 'bg-purple-600' },
  { id: 't5', name: 'Wei C.', initials: 'WC', color: 'bg-rose-600' }
];

const INITIAL_TASKS = [
  { id: 'task1', title: 'Define DB Schema', desc: 'Map out relationships', assignee: 't1', status: 'Done', priority: 'High', due: '12 Days' },
  { id: 'task2', title: 'Setup Repo', desc: 'Initialize Git and React', assignee: 't3', status: 'Done', priority: 'Critical', due: '18 Days' },
  { id: 'task3', title: 'Create Auth Flow', desc: 'Login/Register screens', assignee: 't2', status: 'Review', priority: 'High', due: '10 Days' },
  { id: 'task4', title: 'Design Mockups', desc: 'Figma wireframes', assignee: 't4', status: 'In Progress', priority: 'Medium', due: '8 Days' },
  { id: 'task5', title: 'API Endpoints', desc: 'Node.js backend setup', assignee: 't5', status: 'In Progress', priority: 'High', due: '14 Days' },
  { id: 'task6', title: 'Write Tests', desc: 'Jest unit tests', assignee: 't1', status: 'To Do', priority: 'Low', due: '5 Days' },
  { id: 'task7', title: 'Deploy to Vercel', desc: 'CI/CD pipeline', assignee: 't3', status: 'Backlog', priority: 'Medium', due: '2 Days' },
  { id: 'task8', title: 'User Interviews', desc: 'Gather feedback', assignee: 't2', status: 'To Do', priority: 'Low', due: '15 Days' }
];

const CHANNELS = ['general', 'dev-chat', 'presentation-prep'];

const INITIAL_MESSAGES = [
  { id: 1, user: TEAM[1], text: 'Has anyone looked at the new API docs?', time: '10:42 AM', channel: 'dev-chat' },
  { id: 2, user: TEAM[0], text: 'Yeah, I can take care of the auth endpoint tonight.', time: '10:45 AM', channel: 'dev-chat' },
  { id: 3, user: TEAM[3], text: 'Awesome. I dropped the new UI assets in the folder.', time: '11:00 AM', channel: 'general' }
];

// --- MAIN COMPONENT ---
export default function StackdApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  
  // Font imports (In a real app, put this in index.html)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200 font-sans selection:bg-teal-500/30 overflow-hidden" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col items-center lg:items-start transition-all duration-300">
        <div className="h-16 w-full flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.5)]">
            <span className="font-mono font-bold text-slate-900 leading-none">S</span>
          </div>
          <span className="hidden lg:block ml-3 font-mono font-bold text-xl tracking-wider text-teal-400" style={{ fontFamily: "'Space Mono', monospace" }}>STACKD</span>
        </div>

        <nav className="flex-1 w-full py-6 flex flex-col gap-2 px-3">
          <NavItem icon={<PieChart />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<MessageSquare />} label="Chat" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <NavItem icon={<CheckSquare />} label="Tasks" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem icon={<Layout />} label="Kanban" isActive={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} />
          <NavItem icon={<Video />} label="Meeting" isActive={activeTab === 'video'} onClick={() => setActiveTab('video')} />
          <NavItem icon={<FolderOpen />} label="Files" isActive={activeTab === 'files'} onClick={() => setActiveTab('files')} />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full bg-slate-900">
        
        {/* TOP BAR */}
        <header className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div>
            <h1 className="font-mono text-lg font-bold text-slate-100" style={{ fontFamily: "'Space Mono', monospace" }}>Smart Campus Sustainability App</h1>
            <p className="text-xs text-slate-400">INFO2222 • Group 07</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {TEAM.map(member => (
                <div key={member.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-slate-900 ${member.color}`}>
                  {member.initials}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner">
              <Clock size={14} className="text-amber-400" />
              <span className="text-sm font-mono text-amber-400">18 Days Left</span>
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEW */}
        <div className="flex-1 overflow-auto relative p-6">
          {activeTab === 'dashboard' && <DashboardView tasks={tasks} />}
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'tasks' && <TaskView tasks={tasks} />}
          {activeTab === 'kanban' && <KanbanView tasks={tasks} setTasks={setTasks} />}
          {activeTab === 'video' && <VideoView />}
          {activeTab === 'files' && <FilesView />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-VIEWS ---

function DashboardView({ tasks }) {
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = Math.round((doneTasks / tasks.length) * 100) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-mono text-teal-400" style={{ fontFamily: "'Space Mono', monospace" }}>Mission Control</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Success Meter */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-amber-500 opacity-50"></div>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" className="stroke-slate-700" strokeWidth="12" fill="none" />
              <circle cx="64" cy="64" r="56" className="stroke-teal-400 transition-all duration-1000 ease-out" strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset={351 - (351 * progress) / 100} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-mono font-bold text-slate-100">{progress}%</span>
            </div>
          </div>
          <h3 className="mt-4 font-mono text-slate-300">Completion</h3>
          <div className="mt-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full text-teal-400 text-xs font-bold tracking-widest">
            ON TRACK 🟢
          </div>
        </div>

        {/* Milestones */}
        <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
          <h3 className="font-mono text-lg text-slate-300 mb-4">Milestones</h3>
          <div className="space-y-4">
            <Milestone title="Research complete" done={true} />
            <Milestone title="Prototype built" done={false} current={true} />
            <Milestone title="Final submission" done={false} />
          </div>
        </div>
      </div>
    </div>
  );
}



function KanbanView({ tasks, setTasks }) {
  const columns = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <h2 className="text-2xl font-mono text-teal-400 mb-4 shrink-0" style={{ fontFamily: "'Space Mono', monospace" }}>Kanban Board</h2>
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {columns.map(col => (
          <div 
            key={col} 
            className="w-72 shrink-0 bg-slate-800/30 border border-slate-700/50 rounded-lg flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col)}
          >
            <div className="p-3 border-b border-slate-700/50 font-mono text-sm text-slate-400 flex justify-between items-center">
              {col}
              <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{tasks.filter(t => t.status === col).length}</span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
              {tasks.filter(t => t.status === col).map(task => (
                <div 
                  key={task.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className="bg-slate-800 border border-slate-700 p-3 rounded shadow-sm cursor-grab active:cursor-grabbing hover:border-teal-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${task.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : task.priority === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
                      {task.priority}
                    </span>
                    <div className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold bg-slate-700 border border-slate-600">
                      {TEAM.find(m => m.id === task.assignee)?.initials}
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{task.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{task.due}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('dev-chat');
  const bottomRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), user: TEAM[0], text: input, time: 'Just now', channel: activeChannel };
    setMessages([...messages, newMsg]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const channelMessages = messages.filter(m => m.channel === activeChannel);

  return (
    <div className="h-full flex border border-slate-800 rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Channels Sidebar */}
      <div className="w-48 bg-slate-900/80 border-r border-slate-800 p-4">
        <h3 className="font-mono text-xs text-slate-500 mb-3 uppercase tracking-wider">Channels</h3>
        <div className="space-y-1">
          {CHANNELS.map(ch => (
            <button 
              key={ch} 
              onClick={() => setActiveChannel(ch)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm font-mono ${activeChannel === ch ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              # {ch}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/50">
        <div className="p-4 border-b border-slate-800 font-mono text-teal-400 border-opacity-50 shadow-sm">
          # {activeChannel}
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {channelMessages.map(msg => (
            <div key={msg.id} className="flex gap-3">
              <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs font-bold ${msg.user.color}`}>{msg.user.initials}</div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-sm">{msg.user.name}</span>
                  <span className="text-[10px] text-slate-500">{msg.time}</span>
                </div>
                <p className="text-slate-300 text-sm mt-0.5">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 bg-slate-900">
          <form onSubmit={sendMessage} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-teal-500/50 transition-colors">
            <button type="button" className="text-slate-400 hover:text-teal-400"><Paperclip size={18} /></button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message #${activeChannel}...`}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-slate-500"
            />
            <button type="submit" className="text-teal-400 hover:text-teal-300 bg-teal-500/10 p-1.5 rounded"><Send size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function VideoView() {
  const [isRecording, setIsRecording] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-mono text-teal-400" style={{ fontFamily: "'Space Mono', monospace" }}>Sync Room</h2>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1 rounded-full animate-pulse border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs font-mono">REC 00:14:23</span>
          </div>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {TEAM.slice(0, 5).map((member, i) => (
          <div key={member.id} className="bg-slate-800 rounded-xl overflow-hidden relative border border-slate-700 aspect-video flex items-center justify-center group">
            {camOn || i > 0 ? (
               <div className="absolute inset-0 bg-slate-700/30 flex items-center justify-center">
                  <VideoIcon size={48} className="text-slate-600 opacity-20" />
               </div>
            ) : (
               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${member.color}`}>{member.initials}</div>
            )}
            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-xs font-mono">{member.name}</div>
            <div className="absolute bottom-2 right-2 bg-slate-900/80 p-1 rounded">
               {i % 3 === 0 ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-teal-400" />}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 flex justify-center gap-4 max-w-lg mx-auto w-full">
        <ControlButton icon={micOn ? <Mic /> : <MicOff />} active={micOn} onClick={() => setMicOn(!micOn)} color={micOn ? 'bg-slate-700' : 'bg-red-500/20 text-red-400'} />
        <ControlButton icon={camOn ? <VideoIcon /> : <VideoOff />} active={camOn} onClick={() => setCamOn(!camOn)} color={camOn ? 'bg-slate-700' : 'bg-red-500/20 text-red-400'} />
        <ControlButton icon={<Hand />} active={false} onClick={() => {}} color="bg-slate-700 hover:bg-slate-600" />
        <ControlButton icon={<PhoneOff />} active={true} onClick={() => {}} color="bg-red-500 text-white hover:bg-red-600" />
        <div className="w-px h-10 bg-slate-700 mx-2"></div>
        <button onClick={() => setIsRecording(!isRecording)} className={`px-4 py-2 rounded-xl text-sm font-mono border transition-colors ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-slate-700 border-transparent hover:bg-slate-600'}`}>
          {isRecording ? 'Stop Rec' : 'Record'}
        </button>
      </div>
    </div>
  );
}

// Dummy views for remaining features to ensure completeness
function TaskView({ tasks }) {
  return (
    <div className="animate-in fade-in">
      <h2 className="text-2xl font-mono text-teal-400 mb-6">List View</h2>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-mono text-slate-400 bg-slate-800/80 uppercase border-b border-slate-700">
            <tr><th className="px-6 py-3">Task</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Priority</th><th className="px-6 py-3">Assignee</th></tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-800/80">
                <td className="px-6 py-4 font-medium">{t.title}</td>
                <td className="px-6 py-4 text-slate-400">{t.status}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${t.priority === 'Critical' ? 'text-red-400 bg-red-400/10' : 'text-slate-300 bg-slate-700'}`}>{t.priority}</span></td>
                <td className="px-6 py-4">{TEAM.find(m => m.id === t.assignee)?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilesView() {
  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-mono text-teal-400">Media & Files</h2>
        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded shadow-lg transition-colors">
          <UploadCloud size={18} /> Upload
        </button>
      </div>
      <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500 hover:border-teal-500/50 hover:text-teal-400 transition-colors cursor-pointer bg-slate-800/20">
        <FolderOpen size={48} className="mb-4 opacity-50" />
        <p className="font-mono text-sm">Drag and drop assets here, or click to browse</p>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-teal-500/10 text-teal-400 shadow-[inset_2px_0_0_rgba(20,184,166,1)]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    <div className={`${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</div>
    <span className="hidden lg:block font-mono text-sm">{label}</span>
  </button>
);

const Milestone = ({ title, done, current }) => (
  <div className="flex items-center gap-4">
    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${done ? 'bg-teal-500 border-teal-500' : current ? 'border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'border-slate-600 bg-slate-800'}`}></div>
    <div className={`flex-1 p-3 rounded border ${done ? 'bg-slate-800/30 border-slate-700/50 opacity-50' : current ? 'bg-slate-800 border-amber-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
      <p className={`font-mono text-sm ${done ? 'line-through text-slate-500' : current ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>{title}</p>
    </div>
  </div>
);

const ControlButton = ({ icon, onClick, color }) => (
  <button onClick={onClick} className={`p-4 rounded-xl transition-colors shadow-lg ${color}`}>
    {icon}
  </button>
);

