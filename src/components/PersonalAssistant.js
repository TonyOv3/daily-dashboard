import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ListTodo, BarChart2, Timer } from 'lucide-react';
import TimeAnalytics from './TimeAnalytics';
import { useLocalStorage } from './LocalStorageManager';


const PersonalAssistant = () => {
  // notification permission useEffect here
  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const [schedule] = useState([
    { id: 1, time: '12:00', activity: 'Start Digital Divide Project' },
    { id: 2, time: '14:00', activity: 'Begin garage sorting' },
    { id: 3, time: '16:00', activity: 'Room and clothes sorting' },
    { id: 4, time: '18:00', activity: 'Hair maintenance' },
    { id: 5, time: '19:00', activity: 'Final packing' },
    { id: 6, time: '21:00', activity: 'Departure time' }
  ]);

  // Second: initialTimeBlocks using schedule
  /*const initialTimeBlocks = schedule.map((item, index) => ({
    id: item.id,
    startTime: item.time,
    endTime: schedule[index + 1] ? schedule[index + 1].time :
      new Date(`2024-01-01T${item.time}`).getHours() + 1 + ':00',
    activity: item.activity,
    category: 'work'
  })); 

  const [timeBlocks, setTimeBlocks] = useState(initialTimeBlocks); */

  const [timeBlocks, setTimeBlocks] = useState(
    schedule.map((item, index) => ({
      id: item.id,
      startTime: item.time,
      endTime: schedule[index + 1] ? schedule[index + 1].time :
        new Date(`2024-01-01T${item.time}`).getHours() + 1 + ':00',
      activity: item.activity,
      category: 'work'
    }))
  );



  // Add after your other useState declarations
  const [selectedTask, setSelectedTask] = useState(null);
  const [focusStats, setFocusStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    tasksCompleted: {},  // tracks which tasks were completed during focus time
  });

  const generateTimeBlockSuggestions = () => {
    // Get uncompleted tasks sorted by priority
    const pendingTasks = tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });

    // Start time blocking from current hour, rounded up
    let currentDate = new Date();
    currentDate.setMinutes(0);
    currentDate.setHours(currentDate.getHours() + 1);

    const suggestions = pendingTasks.map(task => {
      const startTime = currentDate.toTimeString().slice(0, 5);

      // Estimate task duration based on priority
      const duration = task.priority === 'high' ? 90 :
        task.priority === 'medium' ? 60 : 45;

      // Calculate end time
      currentDate.setMinutes(currentDate.getMinutes() + duration);
      const endTime = currentDate.toTimeString().slice(0, 5);

      // Add break after each task
      currentDate.setMinutes(currentDate.getMinutes() + 15);

      return {
        id: Date.now() + Math.random(),
        startTime,
        endTime,
        activity: task.title,
        category: 'work',
        priority: task.priority
      };
    });

    return suggestions;
  };

  // Convert schedule to timeBlocks format
  /*const initialTimeBlocks = schedule.map((item, index) => ({
    id: item.id,
    startTime: item.time,
    // Calculate endTime based on next item or +1 hour
    endTime: schedule[index + 1] ? schedule[index + 1].time :
      new Date(`2024-01-01T${item.time}`).getHours() + 1 + ':00',
    activity: item.activity,
    category: 'work'
  })); */

  /* const [timeBlocks, setTimeBlocks] = useState([
    {
      id: 1,
      startTime: '12:00',
      endTime: '14:00',
      activity: 'Start Digital Divide Project',
      category: 'work'
    },
    {
      id: 2,
      startTime: '14:00',
      endTime: '16:00',
      activity: 'Begin garage sorting',
      category: 'work'
    },
    {
      id: 3,
      startTime: '16:00',
      endTime: '18:00',
      activity: 'Room and clothes sorting',
      category: 'work'
    },
    {
      id: 4,
      startTime: '18:00',
      endTime: '19:00',
      activity: 'Hair maintenance',
      category: 'break'
    },
    {
      id: 5,
      startTime: '19:00',
      endTime: '21:00',
      activity: 'Final packing',
      category: 'work'
    },
    {
      id: 6,
      startTime: '21:00',
      endTime: '22:00',
      activity: 'Departure time',
      category: 'work'
    }
  ]); */

  const [newTimeBlock, setNewTimeBlock] = useState({
    startTime: '',
    endTime: '',
    activity: '',
    category: 'work' // 'work', 'break', 'meeting', etc.
  });

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Digital Divide Project', priority: 'high', completed: false },
    { id: 2, title: 'Sort garage items - keep only half', priority: 'high', completed: false },
    { id: 3, title: 'Sort clothes for donation', priority: 'medium', completed: false },
    { id: 4, title: 'Cut hair', priority: 'medium', completed: false },
    { id: 5, title: 'Pack sorted items for travel', priority: 'high', completed: false }
  ]);

  // Then move this up, before the timer useEffect
  const updateFocusStats = useCallback((sessionType) => {
    if (sessionType === 'work' && selectedTask) {
      setFocusStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + 25,
        tasksCompleted: {
          ...prev.tasksCompleted,
          [selectedTask]: (prev.tasksCompleted[selectedTask] || 0) + 1
        }
      }));
    }
  }, [selectedTask, setFocusStats]);

  // Timer state for Pomodoro
  const [timer, setTimer] = useState({
    minutes: 25,
    seconds: 0,
    isActive: false,
    type: 'work',
    sessions: 0
  });

  useEffect(() => {
    let interval;
    if (timer.isActive) {
      interval = setInterval(() => {
        if (timer.seconds === 0) {
          if (timer.minutes === 0) {
            // Timer completed
            const newType = timer.type === 'work' ? 'break' : 'work';
            const newSessions = timer.type === 'work' ? timer.sessions + 1 : timer.sessions;

            // Update focus stats when work session ends
            if (timer.type === 'work') {
              updateFocusStats('work');
            }

            setTimer({
              minutes: newType === 'work' ? 25 : 5,
              seconds: 0,
              isActive: false,
              type: newType,
              sessions: newSessions
            });
          } else {
            setTimer(prev => ({
              ...prev,
              minutes: prev.minutes - 1,
              seconds: 59
            }));
          }
        } else {
          setTimer(prev => ({
            ...prev,
            seconds: prev.seconds - 1
          }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.minutes, timer.seconds, timer.sessions, timer.type, updateFocusStats]);

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium',
    dueDate: ''
  });


  /*const [schedule] = useState([
    { id: 1, time: '12:00', activity: 'Start Digital Divide Project' },
    { id: 2, time: '14:00', activity: 'Begin garage sorting' },
    { id: 3, time: '16:00', activity: 'Room and clothes sorting' },
    { id: 4, time: '18:00', activity: 'Hair maintenance' },
    { id: 5, time: '19:00', activity: 'Final packing' },
    { id: 6, time: '21:00', activity: 'Departure time' }
  ]); */

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  /* const updateFocusStats = (sessionType) => {
    if (sessionType === 'work' && selectedTask) {
      setFocusStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + 25,
        tasksCompleted: {
          ...prev.tasksCompleted,
          [selectedTask]: (prev.tasksCompleted[selectedTask] || 0) + 1
        }
      }));
    }
  };
*/
  const handleTaskChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    setTasks([...tasks, { id: tasks.length + 1, ...newTask, completed: false }]);
    setNewTask({ title: '', priority: 'medium', dueDate: '' });
  };


  useLocalStorage({
    tasks,
    timeBlocks,
    focusStats,
    setTasks,
    setTimeBlocks,
    setFocusStats
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clock Card */}
        <div className="col-span-full bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold flex items-center">
              <Clock className="inline mr-2" />
              {currentTime.toLocaleTimeString()}
            </div>
            <span className="text-xl">Christmas Eve Schedule</span>
          </div>
        </div>

        {/* Pomodoro Timer Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <Timer className="inline mr-2" />
            <span className="text-xl font-bold">Focus Timer</span>
          </div>

          <div className="text-center">

            {/* Task Selection */}
            <div className="mb-4">
              <select
                className="w-full p-2 border rounded"
                value={selectedTask || ''}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">Select a task to focus on...</option>
                {tasks.filter(task => !task.completed).map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Timer Display */}
            <div className="text-6xl font-bold mb-4 font-mono">
              {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
            </div>

            {/* Session Info */}
            <div className="mb-4 text-lg">
              <span className={`px-3 py-1 rounded ${timer.type === 'work' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {timer.type === 'work' ? 'Work Time' : 'Break Time'}
              </span>
              <div className="text-gray-600 mt-2">Session {timer.sessions + 1}</div>
            </div>

            {/* Timer Controls */}
            <div className="space-x-3">
              <button
                onClick={() => setTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`px-6 py-2 rounded-full font-semibold ${timer.isActive
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
              >
                {timer.isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setTimer(prev => ({
                    ...prev,
                    minutes: prev.type === 'work' ? 25 : 5,
                    seconds: 0,
                    isActive: false
                  }));
                }}
                className="px-6 py-2 rounded-full font-semibold bg-gray-500 hover:bg-gray-600 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <ListTodo className="inline mr-2" />
            <span className="text-xl font-bold">Tasks</span>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4"
                />
                <span className={task.completed ? 'line-through' : ''}>
                  {task.title}
                </span>
                <span className={`ml-auto px-2 py-1 rounded text-sm ${task.priority === 'high' ? 'bg-red-100' :
                  task.priority === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Add New Task</h3>
            <form onSubmit={handleTaskSubmit}>
              <div className="space-y-2">
                <input
                  type="text"
                  name="title"
                  value={newTask.title}
                  onChange={handleTaskChange}
                  placeholder="Task title"
                  className="w-full p-2 border rounded"
                />
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleTaskChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleTaskChange}
                  className="w-full p-2 border rounded"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <Clock className="inline mr-2" />
            <span className="text-xl font-bold">Timeline</span>
          </div>

          {/* Add New Time Block Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            setTimeBlocks([...timeBlocks, { ...newTimeBlock, id: Date.now() }]);
            setNewTimeBlock({ startTime: '', endTime: '', activity: '', category: 'work' });
          }} className="mb-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTimeBlock.startTime}
                  onChange={(e) => setNewTimeBlock({ ...newTimeBlock, startTime: e.target.value })}
                  className="p-2 border rounded flex-1"
                />
                <input
                  type="time"
                  value={newTimeBlock.endTime}
                  onChange={(e) => setNewTimeBlock({ ...newTimeBlock, endTime: e.target.value })}
                  className="p-2 border rounded flex-1"
                />
              </div>
              <input
                type="text"
                value={newTimeBlock.activity}
                onChange={(e) => setNewTimeBlock({ ...newTimeBlock, activity: e.target.value })}
                placeholder="Activity description"
                className="w-full p-2 border rounded"
              />
              <select
                value={newTimeBlock.category}
                onChange={(e) => setNewTimeBlock({ ...newTimeBlock, category: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="work">Work</option>
                <option value="break">Break</option>
                <option value="meeting">Meeting</option>
                <option value="focus">Focus Time</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Add Time Block
      </button>
            </div>
          </form>

          {/* Add this before the Time Blocks Display */}
          <div className="mb-4">
            <button
              onClick={() => {
                const suggestions = generateTimeBlockSuggestions();
                if (window.confirm(`Add ${suggestions.length} suggested time blocks based on your tasks?`)) {
                  setTimeBlocks([...timeBlocks, ...suggestions]);
                }
              }}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <span>Generate AI Suggestions</span>
              <span className="text-xs bg-green-600 px-2 py-1 rounded">
                Based on {tasks.filter(t => !t.completed).length} pending tasks
    </span>
            </button>
          </div>

          {/* Time Blocks Display */}
          <div className="space-y-2">
            {timeBlocks
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(block => (
                <div
                  key={block.id}
                  className={`p-2 rounded border ${block.category === 'work' ? 'bg-blue-50' :
                    block.category === 'break' ? 'bg-green-50' :
                      block.category === 'meeting' ? 'bg-purple-50' :
                        'bg-yellow-50'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono">
                      {new Date(`2024-01-01T${block.startTime}`).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                      {' - '}
                      {new Date(`2024-01-01T${block.endTime}`).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                    <button
                      onClick={() => setTimeBlocks(timeBlocks.filter(b => b.id !== block.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
            </button>
                  </div>
                  <div className="mt-1">
                    {block.activity}
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${block.category === 'work' ? 'bg-blue-100' :
                      block.category === 'break' ? 'bg-green-100' :
                        block.category === 'meeting' ? 'bg-purple-100' :
                          'bg-yellow-100'
                      }`}>
                      {block.category}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Focus Statistics Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <BarChart2 className="inline mr-2" />
            <span className="text-xl font-bold">Focus Statistics</span>
          </div>
          <div className="space-y-2">
            <div>Total Focus Sessions: {focusStats.totalSessions}</div>
            <div>Total Minutes Focused: {focusStats.totalMinutes}</div>
            <div>Tasks Worked On:</div>
            <ul className="ml-4">
              {Object.entries(focusStats.tasksCompleted).map(([taskId, sessions]) => (
                <li key={taskId}>
                  {tasks.find(t => t.id.toString() === taskId)?.title}: {sessions} sessions
                </li>
              ))}
            </ul>
          </div>
        </div>

        <TimeAnalytics
          timeBlocks={timeBlocks}
          focusStats={focusStats}
        />

        {/* Progress Card */}
        <div className="col-span-full bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <BarChart2 className="inline mr-2" />
            <span className="text-xl font-bold">Progress</span>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Tasks Completed</span>
              <span>
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded">
              <div
                className="bg-blue-500 rounded h-2"
                style={{
                  width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAssistant;