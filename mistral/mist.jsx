import React, { useState, useReducer, useRef, useEffect } from 'react';

// Mock Data
const mockTeam = [
  { id: 1, name: 'Alex T.', avatar: 'AT' },
  { id: 2, name: 'Priya M.', avatar: 'PM' },
  { id: 3, name: 'Jordan K.', avatar: 'JK' },
  { id: 4, name: 'Sam L.', avatar: 'SL' },
  { id: 5, name: 'Wei C.', avatar: 'WC' },
];

const mockChannels = [
  { id: 1, name: '#general' },
  { id: 2, name: '#dev-chat' },
  { id: 3, name: '#presentation-prep' },
];

const mockMessages = {
  1: [
    { id: 1, sender: 'Alex T.', text: 'Welcome to the project! Let’s get started.', timestamp: '10:00 AM' },
    { id: 2, sender: 'Priya M.', text: 'I’ll handle the research milestone.', timestamp: '10:05 AM' },
  ],
  2: [
    { id: 1, sender: 'Jordan K.', text: 'Who’s working on the API?', timestamp: 'Yesterday' },
    { id: 2, sender: 'Sam L.', text: 'I am! Will push updates soon.', timestamp: 'Yesterday' },
  ],
  3: [
    { id: 1, sender: 'Wei C.', text: 'Let’s sync on the presentation slides.', timestamp: 'Today' },
  ],
};

const mockTasks = [
  { id: 1, title: 'Research campus energy usage', assignee: 'Priya M.', due: 'Mar 15', priority: 'High', status: 'In Progress' },
  { id: 2, title: 'Design UI wireframes', assignee: 'Alex T.', due: 'Mar 16', priority: 'Medium', status: 'To Do' },
  { id: 3, title: 'Build API endpoint', assignee: 'Sam L.', due: 'Mar 17', priority: 'Critical', status: 'Review' },
  { id: 4, title: 'Write project report', assignee: 'Jordan K.', due: 'Mar 18', priority: 'Low', status: 'Backlog' },
  { id: 5, title: 'Prepare presentation slides', assignee: 'Wei C.', due: 'Mar 19', priority: 'High', status: 'Done' },
];

const mockMilestones = [
  { id: 1, name: 'Research complete', completed: true },
  { id: 2, name: 'Prototype built', completed: false },
  { id: 3, name: 'Final submission', completed: false },
];

// Helper Components
const Avatar = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
    {name.split(' ').map(n => n[0]).join('')}
  </div>
);

// Main App
const Stackd = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeChannel, setActiveChannel] = useState(1);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [tasks, setTasks] = useState(mockTasks);
  const [milestones, setMilestones] = useState(mockMilestones);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [files, setFiles] = useState([]);
  const [isPiP, setIsPiP] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const newMsg = {
      id: messages[activeChannel].length + 1,
      sender: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages({
      ...messages,
      [activeChannel]: [...messages[activeChannel], newMsg],
    });
    setNewMessage('');
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const updatedTasks = tasks.map(task =>
      task.id === parseInt(taskId) ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  };

  const handleToggleMilestone = (id) => {
    const updatedMilestones = milestones.map(m =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updatedMilestones);
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setRecordings([...recordings, { id: recordings.length + 1, date: new Date().toLocaleString() }]);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files).map(file => ({
      id: files.length + 1,
      name: file.name,
      uploader: 'You',
      url: URL.createObjectURL(file),
    }));
    setFiles([...files, ...uploadedFiles]);
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6 text-teal-400">Stackd</h1>
        <nav className="flex-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'chat' ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
          >
            Group Chat
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'tasks' ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'kanban' ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'dashboard' ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'video' ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
          >
            Video Call
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`w-full text-left p-2 rounded mb-1 ${activeTab === 'files' ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
          >
            Files
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
          <h2 className="font-bold text-lg">
            {activeTab === 'chat' ? mockChannels.find(c => c.id === activeChannel)?.name :
             activeTab === 'tasks' ? 'Task Assignment' :
             activeTab === 'kanban' ? 'Kanban Board' :
             activeTab === 'dashboard' ? 'Project Success Meter' :
             activeTab === 'video' ? 'Video Call' : 'File Upload Hub'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Deadline: 18 days</span>
            {mockTeam.map(member => (
              <Avatar key={member.id} name={member.name} />
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto mb-4">
                {messages[activeChannel]?.map(msg => (
                  <div key={msg.id} className="mb-4 flex">
                    <Avatar name={msg.sender} />
                    <div className="ml-2">
                      <div className="flex items-baseline">
                        <span className="font-bold mr-2">{msg.sender}</span>
                        <span className="text-xs text-gray-400">{msg.timestamp}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-l bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-teal-600 text-white p-2 rounded-r hover:bg-teal-700"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Task List</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                  <div key={task.id} className="bg-gray-800 p-3 rounded border border-gray-700">
                    <h4 className="font-bold">{task.title}</h4>
                    <p className="text-sm text-gray-400">Assigned to: {task.assignee}</p>
                    <p className="text-sm text-gray-400">Due: {task.due}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${task.priority === 'Critical' ? 'bg-red-600' : task.priority === 'High' ? 'bg-amber-600' : 'bg-gray-600'}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="flex space-x-4 overflow-auto pb-4">
              {['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].map(status => (
                <div
                  key={status}
                  className="min-w-[250px] bg-gray-800 p-3 rounded border border-gray-700"
                  onDrop={(e) => handleDrop(e, status)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <h4 className="font-bold mb-2">{status}</h4>
                  {getTasksByStatus(status).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-gray-700 p-2 mb-2 rounded cursor-move"
                    >
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-xs text-gray-400">{task.assignee}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${task.priority === 'Critical' ? 'bg-red-600' : task.priority === 'High' ? 'bg-amber-600' : 'bg-gray-600'}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Project Success Meter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h4 className="font-bold mb-2">Overall Progress</h4>
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                      <circle
                        className="text-teal-500"
                        strokeWidth="10"
                        strokeDasharray="283"
                        strokeDashoffset="141.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <span className="text-xl font-bold">50%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h4 className="font-bold mb-2">Milestones</h4>
                  <ul className="space-y-2">
                    {milestones.map(m => (
                      <li key={m.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => handleToggleMilestone(m.id)}
                          className="mr-2"
                        />
                        <span className={m.completed ? 'line-through text-gray-400' : ''}>{m.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h4 className="font-bold mb-2">Status</h4>
                  <p className="text-2xl font-bold text-amber-400">At Risk 🟡</p>
                  <p className="text-sm text-gray-400">18 days remaining</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-gray-800 rounded border border-gray-700 flex items-center justify-center relative">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-40 h-32 bg-gray-700 rounded flex items-center justify-center">
                      <Avatar name={`Member ${i+1}`} />
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">🎤</button>
                  <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">📹</button>
                  <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">🖥️</button>
                  <button
                    onClick={handleRecordToggle}
                    className={`p-2 rounded ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                  <button className="bg-gray-700 p-2 rounded hover:bg-gray-600">🙋</button>
                  <button className="bg-red-600 p-2 rounded hover:bg-red-700">📞</button>
                </div>
                <button
                  onClick={() => setIsPiP(!isPiP)}
                  className="absolute top-4 right-4 bg-gray-700 p-2 rounded hover:bg-gray-600"
                >
                  {isPiP ? '🖼️' : '🔳'}
                </button>
              </div>
              {isRecording && (
                <div className="mt-2 text-center text-sm text-gray-400">
                  Recording in progress... {recordings.length} recording(s) saved.
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map(file => (
                    <div key={file.id} className="bg-gray-800 p-3 rounded border border-gray-700">
                      <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded mb-2" />
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">Uploaded by {file.uploader}</p>
                      <div className="flex space-x-2 mt-2">
                        <button className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">Download</button>
                        <button className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700 text-center">
                <label className="block text-sm font-medium mb-2">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-teal-600 file:text-white
                    hover:file:bg-teal-700"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stackd;

