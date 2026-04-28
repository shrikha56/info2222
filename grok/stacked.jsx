import React, { useState, useEffect, useRef, useCallback } from 'react';

const App = () => {
  // Mock data seeding
  const team = [
    { name: 'Alex T.', avatar: 'AT' },
    { name: 'Priya M.', avatar: 'PM' },
    { name: 'Jordan K.', avatar: 'JK' },
    { name: 'Sam L.', avatar: 'SL' },
    { name: 'Wei C.', avatar: 'WC' },
  ];

  const projectName = 'Smart Campus Sustainability App';
  const projectDueDate = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000); // 18 days from now

  const initialChannels = [
    {
      name: 'general',
      messages: [
        { id: 1, sender: 'Alex T.', text: 'Hey team, let\'s get started!', timestamp: new Date(Date.now() - 3600000), reactions: {}, reads: team.map(t => t.name) },
        { id: 2, sender: 'Priya M.', text: '@Alex T. Sounds good!', timestamp: new Date(Date.now() - 1800000), reactions: { '👍': ['Alex T.'] }, reads: team.map(t => t.name) },
      ],
    },
    {
      name: 'dev-chat',
      messages: [
        { id: 1, sender: 'Jordan K.', text: 'Working on the backend API.', timestamp: new Date(Date.now() - 7200000), reactions: {}, reads: team.map(t => t.name) },
      ],
    },
    {
      name: 'presentation-prep',
      messages: [
        { id: 1, sender: 'Sam L.', text: 'Need slides for demo.', timestamp: new Date(Date.now() - 10800000), reactions: {}, reads: team.map(t => t.name) },
      ],
    },
  ];

  const initialTasks = [
    { id: 1, title: 'Research sustainability metrics', description: 'Gather data on campus energy use', assignees: ['Alex T.'], dueDate: '2026-03-20', priority: 'High', status: 'Done' },
    { id: 2, title: 'Design UI wireframes', description: 'Create low-fid prototypes', assignees: ['Priya M.', 'Jordan K.'], dueDate: '2026-03-15', priority: 'Medium', status: 'In Progress' },
    { id: 3, title: 'Set up database', description: 'Initialize MongoDB schema', assignees: ['Sam L.'], dueDate: '2026-03-18', priority: 'Critical', status: 'To Do' },
    { id: 4, title: 'Write API endpoints', description: 'User auth and data fetch', assignees: ['Wei C.'], dueDate: '2026-03-22', priority: 'Low', status: 'Backlog' },
    { id: 5, title: 'Test frontend components', description: 'Unit tests for React', assignees: ['Alex T.'], dueDate: '2026-03-25', priority: 'Medium', status: 'Review' },
    { id: 6, title: 'Prepare presentation', description: 'Slides and script', assignees: ['Priya M.'], dueDate: '2026-03-28', priority: 'High', status: 'To Do' },
    { id: 7, title: 'Gather user feedback', description: 'Survey campus students', assignees: ['Jordan K.', 'Sam L.'], dueDate: '2026-03-30', priority: 'Medium', status: 'Backlog' },
    { id: 8, title: 'Optimize performance', description: 'Reduce load times', assignees: ['Wei C.'], dueDate: '2026-04-01', priority: 'Critical', status: 'In Progress' },
    { id: 9, title: 'Document code', description: 'API docs and comments', assignees: ['Alex T.'], dueDate: '2026-04-05', priority: 'Low', status: 'Done' },
    { id: 10, title: 'Deploy to staging', description: 'Heroku setup', assignees: ['Priya M.'], dueDate: '2026-04-10', priority: 'High', status: 'Review' },
  ];

  const initialMilestones = [
    { name: 'Research complete', completed: true },
    { name: 'Prototype built', completed: false },
    { name: 'Final submission', completed: false },
  ];

  // States
  const [currentPage, setCurrentPage] = useState('chat');
  const [channels, setChannels] = useState(initialChannels);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [tasks, setTasks] = useState(initialTasks);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [uploads, setUploads] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);

  // Calculated metrics for Success Meter
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const completionPercentage = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
  const daysRemaining = Math.ceil((projectDueDate - new Date()) / (1000 * 60 * 60 * 24));
  const completedMilestones = milestones.filter(m => m.completed).length;
  const milestonePercentage = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  const contributionScores = team.reduce((acc, member) => {
    const memberTasks = tasks.filter(t => t.assignees.includes(member.name));
    const memberDone = memberTasks.filter(t => t.status === 'Done').length;
    acc[member.name] = memberTasks.length > 0 ? (memberDone / memberTasks.length) * 100 : 0;
    return acc;
  }, {});

  let statusLabel = 'On Track 🟢';
  let statusColor = 'text-green-500';
  if (completionPercentage < 50 || daysRemaining < 5) {
    statusLabel = 'Critical 🔴';
    statusColor = 'text-red-500';
  } else if (completionPercentage < 75 || daysRemaining < 10) {
    statusLabel = 'At Risk 🟡';
    statusColor = 'text-yellow-500';
  }

  // Timer for recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordings(prev => [...prev, { id: prev.length + 1, duration: recordingTime, timestamp: new Date() }]);
  };

  // Drag and drop for Kanban
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(prev => prev.map(task => task.id === parseInt(taskId) ? { ...task, status: newStatus } : task));
  };

  // Components
  const Avatar = ({ name, avatar }) => (
    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-mono">{avatar}</div>
  );

  const PriorityBadge = ({ priority }) => {
    let color = 'bg-gray-500';
    if (priority === 'Low') color = 'bg-blue-500';
    if (priority === 'Medium') color = 'bg-yellow-500';
    if (priority === 'High') color = 'bg-orange-500';
    if (priority === 'Critical') color = 'bg-red-500';
    return <span className={`px-2 py-1 rounded text-xs font-mono ${color}`}>{priority}</span>;
  };

  const ProgressCircle = ({ percentage, color = 'teal' }) => {
    const radius = 36;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <svg height={radius * 2} width={radius * 2} className="transition-all duration-1000">
        <circle
          stroke="slate-700"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={`rgb(45 212 191)`} // teal-400
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    );
  };

  const Chat = () => {
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [channels]);

    const currentChannel = channels.find(c => c.name === selectedChannel);
    const addMessage = () => {
      if (!newMessage.trim()) return;
      const newMsg = {
        id: currentChannel.messages.length + 1,
        sender: 'You', // Mock current user
        text: newMessage,
        timestamp: new Date(),
        reactions: {},
        reads: team.map(t => t.name),
      };
      setChannels(prev => prev.map(c => c.name === selectedChannel ? { ...c, messages: [...c.messages, newMsg] } : c));
      setNewMessage('');
    };

    const handleFileUpload = e => {
      const file = e.target.files[0];
      if (file) {
        // Mock upload
        const mockUrl = URL.createObjectURL(file);
        const newMsg = {
          id: currentChannel.messages.length + 1,
          sender: 'You',
          text: '',
          image: mockUrl,
          timestamp: new Date(),
          reactions: {},
          reads: team.map(t => t.name),
        };
        setChannels(prev => prev.map(c => c.name === selectedChannel ? { ...c, messages: [...c.messages, newMsg] } : c));
      }
    };

    const addReaction = (msgId, emoji) => {
      setChannels(prev => prev.map(c => {
        if (c.name !== selectedChannel) return c;
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id !== msgId) return m;
            const reactions = { ...m.reactions };
            reactions[emoji] = reactions[emoji] ? [...reactions[emoji], 'You'] : ['You'];
            return { ...m, reactions };
          }),
        };
      }));
    };

    return (
      <div className="flex h-full">
        <div className="w-48 bg-slate-800 p-4">
          <h2 className="font-mono mb-4">Channels</h2>
          {channels.map(channel => (
            <div
              key={channel.name}
              className={`cursor-pointer mb-2 ${selectedChannel === channel.name ? 'text-teal-400' : ''}`}
              onClick={() => setSelectedChannel(channel.name)}
            >
              #{channel.name}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col p-4">
          <h2 className="font-mono mb-4">#{selectedChannel}</h2>
          <div className="flex-1 overflow-y-auto mb-4">
            {currentChannel.messages.map(msg => (
              <div key={msg.id} className="mb-4">
                <div className="flex items-center">
                  <Avatar name={msg.sender} avatar={msg.sender.split(' ').map(n => n[0]).join('')} />
                  <span className="ml-2 font-mono">{msg.sender}</span>
                  <span className="ml-2 text-xs text-gray-400">{msg.timestamp.toLocaleTimeString()}</span>
                </div>
                {msg.text && <p>{msg.text}</p>}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="uploaded"
                    className="w-32 h-32 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(msg.image)}
                  />
                )}
                <div className="flex text-xs">
                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                    <span key={emoji} className="mr-2">{emoji} {users.length}</span>
                  ))}
                  <span className="cursor-pointer" onClick={() => addReaction(msg.id, '👍')}>+ 👍</span>
                </div>
                <div className="text-xs text-gray-400">Read by {msg.reads.length}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-700 p-2 rounded-l"
              placeholder="Type a message..."
            />
            <button onClick={addMessage} className="bg-teal-500 p-2">Send</button>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="chat-upload" />
            <label htmlFor="chat-upload" className="bg-amber-500 p-2 cursor-pointer rounded-r">Upload</label>
          </div>
        </div>
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="expanded" className="max-w-3/4 max-h-3/4" />
          </div>
        )}
      </div>
    );
  };

  const TaskAssignment = () => {
    const [newTask, setNewTask] = useState({
      title: '', description: '', assignees: [], dueDate: '', priority: 'Medium', status: 'Backlog',
    });
    const [filterAssignee, setFilterAssignee] = useState('');
    const [sortBy, setSortBy] = useState('dueDate');

    const addTask = () => {
      if (!newTask.title) return;
      setTasks(prev => [...prev, { id: prev.length + 1, ...newTask }]);
      setNewTask({ title: '', description: '', assignees: [], dueDate: '', priority: 'Medium', status: 'Backlog' });
    };

    const updateTask = (id, updates) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTask = id => {
      setTasks(prev => prev.filter(t => t.id !== id));
    };

    const filteredTasks = tasks
      .filter(t => !filterAssignee || t.assignees.includes(filterAssignee))
      .sort((a, b) => {
        if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
        if (sortBy === 'priority') {
          const prioOrder = { Low: 0, Medium: 1, High: 2, Critical: 3 };
          return prioOrder[a.priority] - prioOrder[b.priority];
        }
        return 0;
      });

    return (
      <div className="flex flex-col h-full">
        <h2 className="font-mono mb-4">Task Assignment</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            className="bg-slate-700 p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            className="bg-slate-700 p-2 mr-2"
          />
          <select
            multiple
            value={newTask.assignees}
            onChange={e => setNewTask({ ...newTask, assignees: Array.from(e.target.selectedOptions, o => o.value) })}
            className="bg-slate-700 p-2 mr-2"
          >
            {team.map(member => <option key={member.name} value={member.name}>{member.name}</option>)}
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="bg-slate-700 p-2 mr-2"
          />
          <select
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            className="bg-slate-700 p-2 mr-2"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
          <button onClick={addTask} className="bg-teal-500 p-2">Add Task</button>
        </div>
        <div className="mb-4">
          <select onChange={e => setFilterAssignee(e.target.value)} className="bg-slate-700 p-2 mr-2">
            <option value="">Filter by Assignee</option>
            {team.map(member => <option key={member.name} value={member.name}>{member.name}</option>)}
          </select>
          <select onChange={e => setSortBy(e.target.value)} className="bg-slate-700 p-2">
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
        <div className="overflow-y-auto">
          {filteredTasks.map(task => (
            <div key={task.id} className="mb-4 p-4 bg-slate-800 rounded">
              <h3 className="font-mono">{task.title}</h3>
              <p>{task.description}</p>
              <div className="flex">
                {task.assignees.map(a => <Avatar key={a} name={a} avatar={a.split(' ').map(n => n[0]).join('')} />)}
              </div>
              <p>Due: {task.dueDate}</p>
              <PriorityBadge priority={task.priority} />
              <select
                value={task.status}
                onChange={e => updateTask(task.id, { status: e.target.value })}
                className="bg-slate-700 p-2 ml-2"
              >
                <option>Backlog</option>
                <option>To Do</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Done</option>
              </select>
              <button onClick={() => deleteTask(task.id)} className="bg-red-500 p-2 ml-2">Delete</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const KanbanBoard = () => {
    const columns = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

    return (
      <div className="flex h-full overflow-x-auto">
        {columns.map(column => (
          <div
            key={column}
            className="w-64 bg-slate-800 p-4 mr-4 rounded"
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, column)}
          >
            <h2 className="font-mono mb-4">{column}</h2>
            {tasks.filter(t => t.status === column).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={e => handleDragStart(e, task.id)}
                className="mb-4 p-4 bg-slate-700 rounded shadow-md cursor-move transition-shadow hover:shadow-lg"
              >
                <h3 className="font-mono text-sm">{task.title}</h3>
                <div className="flex mt-2">
                  {task.assignees.map(a => <Avatar key={a} name={a} avatar={a.split(' ').map(n => n[0]).join('')} />)}
                </div>
                <p className="text-xs mt-2">Due: {task.dueDate}</p>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const ProjectSuccessMeter = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800 rounded">
          <h2 className="font-mono mb-4">Project Completion</h2>
          <div className="flex items-center justify-center">
            <ProgressCircle percentage={completionPercentage} />
          </div>
          <p className="text-center mt-2">{completionPercentage.toFixed(0)}%</p>
        </div>
        <div className="p-4 bg-slate-800 rounded">
          <h2 className="font-mono mb-4">Milestone Tracker</h2>
          <div className="flex items-center justify-center">
            <ProgressCircle percentage={milestonePercentage} />
          </div>
          <p className="text-center mt-2">{milestonePercentage.toFixed(0)}%</p>
          {milestones.map((m, i) => (
            <div key={m.name} className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={m.completed}
                onChange={() => setMilestones(prev => prev.map((pm, pi) => pi === i ? { ...pm, completed: !pm.completed } : pm))}
              />
              <span className="ml-2">{m.name}</span>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-800 rounded col-span-2">
          <h2 className="font-mono mb-4">Member Contributions</h2>
          <div className="flex justify-around">
            {team.map(member => (
              <div key={member.name} className="text-center">
                <Avatar name={member.name} avatar={member.avatar} />
                <div className="h-20 w-8 bg-slate-700 mt-2 rounded">
                  <div className="bg-teal-500 rounded transition-all duration-1000" style={{ height: `${contributionScores[member.name]}%` }}></div>
                </div>
                <p className="text-xs">{contributionScores[member.name].toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-slate-800 rounded text-center">
          <h2 className="font-mono mb-4">Days Remaining</h2>
          <p className="text-4xl">{daysRemaining}</p>
        </div>
        <div className="p-4 bg-slate-800 rounded text-center">
          <h2 className="font-mono mb-4">Status</h2>
          <p className={`text-2xl ${statusColor}`}>{statusLabel}</p>
        </div>
      </div>
    );
  };

  const VideoCallPanel = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [raisedHands, setRaisedHands] = useState([]);

    const toggleRaiseHand = name => {
      setRaisedHands(prev => prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name]);
    };

    return (
      <div className="flex h-full">
        <div className="flex-1 grid grid-cols-3 gap-4 p-4">
          {team.map(member => (
            <div key={member.name} className="bg-slate-800 rounded flex items-center justify-center relative">
              <Avatar name={member.name} avatar={member.avatar} />
              {raisedHands.includes(member.name) && <span className="absolute top-2 right-2">✋</span>}
            </div>
          ))}
        </div>
        <div className="w-48 bg-slate-800 p-4">
          <h2 className="font-mono mb-4">Participants</h2>
          {team.map(member => (
            <div key={member.name} className="flex items-center mb-2">
              <Avatar name={member.name} avatar={member.avatar} />
              <span className="ml-2">{member.name}</span>
              <button onClick={() => toggleRaiseHand(member.name)} className="ml-auto text-xs">✋</button>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex bg-slate-700 p-2 rounded">
          <button onClick={() => setIsMuted(!isMuted)} className="mx-2">{isMuted ? 'Unmute' : 'Mute'}</button>
          <button onClick={() => setIsCameraOn(!isCameraOn)} className="mx-2">{isCameraOn ? 'Camera Off' : 'Camera On'}</button>
          <button onClick={() => setIsScreenSharing(!isScreenSharing)} className="mx-2">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</button>
          {isRecording ? (
            <button onClick={stopRecording} className="mx-2 bg-red-500 animate-pulse">Stop Recording ({recordingTime}s)</button>
          ) : (
            <button onClick={startRecording} className="mx-2">Record</button>
          )}
          <button className="mx-2">End Call</button>
          <button className="mx-2">PiP</button>
        </div>
        <div className="absolute top-4 right-4 bg-slate-800 p-4 rounded">
          <h2 className="font-mono mb-2">Recordings</h2>
          {recordings.map(rec => (
            <div key={rec.id} className="text-xs mb-1">Recording {rec.id}: {rec.duration}s <button className="ml-2">Download</button></div>
          ))}
        </div>
      </div>
    );
  };

  const PhotoFileUploadHub = () => {
    const [tags, setTags] = useState({});
    const [filterTag, setFilterTag] = useState('');
    const [filterUploader, setFilterUploader] = useState('');

    const handleDrop = e => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const mockUrl = URL.createObjectURL(file);
        setUploads(prev => [...prev, { id: prev.length + 1, name: file.name, url: mockUrl, uploader: 'You', tags: [] }]);
      }
    };

    const handleDragOver = e => {
      e.preventDefault();
    };

    const addTag = (id, tag) => {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, tags: [...u.tags, tag] } : u));
      setTags({ ...tags, [id]: '' });
    };

    const deleteUpload = id => {
      setUploads(prev => prev.filter(u => u.id !== id));
    };

    const filteredUploads = uploads.filter(u => 
      (!filterTag || u.tags.includes(filterTag)) &&
      (!filterUploader || u.uploader === filterUploader)
    );

    return (
      <div className="flex flex-col h-full" onDrop={handleDrop} onDragOver={handleDragOver}>
        <h2 className="font-mono mb-4">Media Library</h2>
        <div className="mb-4 p-4 bg-slate-800 rounded text-center">Drag & Drop Files Here</div>
        <input type="file" onChange={e => handleDrop({ dataTransfer: { files: e.target.files }, preventDefault: () => {} })} className="mb-4" />
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filter by Tag"
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="bg-slate-700 p-2 mr-2"
          />
          <select
            value={filterUploader}
            onChange={e => setFilterUploader(e.target.value)}
            className="bg-slate-700 p-2"
          >
            <option value="">Filter by Uploader</option>
            <option value="You">You</option>
            {/* Add more if needed */}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-4 overflow-y-auto">
          {filteredUploads.map(upload => (
            <div key={upload.id} className="p-4 bg-slate-800 rounded">
              <img src={upload.url} alt={upload.name} className="w-full h-32 object-cover mb-2" />
              <p className="text-xs">{upload.name}</p>
              <p className="text-xs">By: {upload.uploader}</p>
              <div className="flex flex-wrap">
                {upload.tags.map(tag => <span key={tag} className="text-xs bg-teal-500 px-1 mr-1 mb-1 rounded">{tag}</span>)}
              </div>
              <input
                type="text"
                placeholder="Add tag"
                value={tags[upload.id] || ''}
                onChange={e => setTags({ ...tags, [upload.id]: e.target.value })}
                className="bg-slate-700 p-1 text-xs mt-2"
              />
              <button onClick={() => addTag(upload.id, tags[upload.id])} className="text-xs bg-amber-500 p-1 mt-1">Add</button>
              <button onClick={() => navigator.clipboard.writeText(upload.url)} className="text-xs bg-teal-500 p-1 mt-1 ml-2">Copy Link</button>
              <button onClick={() => deleteUpload(upload.id)} className="text-xs bg-red-500 p-1 mt-1 ml-2">Delete</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-4 flex flex-col transition-all duration-300">
        <h1 className="font-mono text-teal-400 mb-8">Stackd</h1>
        <nav>
          <ul>
            <li className={`cursor-pointer mb-4 ${currentPage === 'chat' ? 'text-teal-400' : ''}`} onClick={() => setCurrentPage('chat')}>Group Chat</li>
            <li className={`cursor-pointer mb-4 ${currentPage === 'tasks' ? 'text-teal-400' : ''}`} onClick={() => setCurrentPage('tasks')}>Task Assignment</li>
            <li className={`cursor-pointer mb-4 ${currentPage === 'kanban' ? 'text-teal-400' : ''}`} onClick={() => setCurrentPage('kanban')}>Kanban Board</li>
            <li className={`cursor-pointer mb-4 ${currentPage === 'success' ? 'text-teal-400' : ''}`} onClick={() => setCurrentPage('success')}>Project Success Meter</li>
            <li className={`cursor-pointer mb-4 ${currentPage === 'video' ? 'text-teal-400' : ''}`} onClick={() => setCurrentPage('video')}>Video Call</li>
            <li className={`cursor-pointer mb-4 ${currentPage === 'uploads' ? 'text-teal-400' : ''}`} onClick={() => setCurrentPage('uploads')}>Photo/File Upload</li>
          </ul>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <h1 className="font-mono text-xl">{projectName}</h1>
          <div className="flex">
            {team.map(member => <Avatar key={member.name} name={member.name} avatar={member.avatar} />)}
          </div>
          <div className="font-mono text-amber-400">Due in {daysRemaining} days</div>
        </div>
        {/* Page Content */}
        <div className="flex-1 p-4 overflow-auto transition-all duration-300">
          {currentPage === 'chat' && <Chat />}
          {currentPage === 'tasks' && <TaskAssignment />}
          {currentPage === 'kanban' && <KanbanBoard />}
          {currentPage === 'success' && <ProjectSuccessMeter />}
          {currentPage === 'video' && <VideoCallPanel />}
          {currentPage === 'uploads' && <PhotoFileUploadHub />}
        </div>
      </div>
    </div>
  );
};

export default App;