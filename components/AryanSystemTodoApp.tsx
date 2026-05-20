'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Save,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Tag,
  Clock,
  Zap,
  Award,
  Activity,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'STRENGTH' | 'ACADEMIC' | 'DIGITAL' | 'VOICE' | 'COMBAT' | 'SKINCARE' | 'LIFE';
  dueDate?: string;
  dueTime?: string;
  expReward: number;
  createdAt: string;
  completedAt?: string;
  subtasks?: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface PlayerStats {
  name: string;
  level: number;
  exp: number;
  hp: number;
  mp: number;
  streak: number;
  rank: string;
  weight: number;
  age: number;
  class: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  STRENGTH: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600', icon: '💪' },
  ACADEMIC: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600', icon: '📚' },
  DIGITAL: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-600', icon: '💻' },
  VOICE: { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600', icon: '🎤' },
  COMBAT: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-600', icon: '🥊' },
  SKINCARE: { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-600', icon: '🧴' },
  LIFE: { bg: 'bg-gray-50', border: 'border-gray-500', text: 'text-gray-600', icon: '⏰' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-green-100', text: 'text-green-700' },
};

const DEFAULT_PLAYER_STATS: PlayerStats = {
  name: 'ARYAN',
  level: 1,
  exp: 0,
  hp: 100,
  mp: 100,
  streak: 0,
  rank: 'E-RANK',
  weight: 40,
  age: 15,
  class: '11th PCM',
};

const DEFAULT_SCHEDULE = [
  { id: 't1', time: '04:30 AM', endTime: '05:15 AM', title: 'Calisthenics & Meditation', module: 'STRENGTH', exp: 150 },
  { id: 't2', time: '07:00 AM', endTime: '09:00 AM', title: 'Gym (Heavy Lifting)', module: 'STRENGTH', exp: 200 },
  { id: 't3', time: '10:00 AM', endTime: '11:30 AM', title: 'Computer Class (Data Entry)', module: 'DIGITAL', exp: 100 },
  { id: 't4', time: '12:30 PM', endTime: '04:15 PM', title: 'Aakash Coaching', module: 'ACADEMIC', exp: 300 },
  { id: 't5', time: '04:30 PM', endTime: '05:00 PM', title: 'YouTube Video Editing', module: 'DIGITAL', exp: 80 },
  { id: 't6', time: '05:20 PM', endTime: '05:40 PM', title: 'Voice Practice', module: 'VOICE', exp: 150 },
  { id: 't7', time: '05:40 PM', endTime: '06:00 PM', title: 'Typing Practice', module: 'DIGITAL', exp: 60 },
  { id: 't8', time: '06:30 PM', endTime: '07:30 PM', title: 'Martial Arts & Meditation', module: 'COMBAT', exp: 180 },
  { id: 't9', time: '09:00 PM', endTime: '10:00 PM', title: 'Study (Deep Work)', module: 'ACADEMIC', exp: 200 },
  { id: 't10', time: '10:00 PM', endTime: '10:15 PM', title: 'Vessel Maintenance (Skincare)', module: 'SKINCARE', exp: 30 },
];

export default function AryanSystemTodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(DEFAULT_PLAYER_STATS);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'STRENGTH' | 'ACADEMIC' | 'DIGITAL' | 'VOICE' | 'COMBAT' | 'SKINCARE' | 'LIFE'>('ACADEMIC');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskExp, setNewTaskExp] = useState(100);
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDueTime, setNewTaskDueTime] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showScheduleView, setShowScheduleView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('aryan_tasks');
    const savedStats = localStorage.getItem('aryan_stats');

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }

    if (savedStats) {
      try {
        setPlayerStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aryan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aryan_stats', JSON.stringify(playerStats));
  }, [playerStats]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDueDate,
      dueTime: newTaskDueTime,
      expReward: newTaskExp,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDueDate('');
    setNewTaskDueTime('');
    setNewTaskPriority('medium');
    setNewTaskExp(100);
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const isCompleting = !task.completed;
          const updated = {
            ...task,
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : undefined,
          };

          if (isCompleting) {
            // Award EXP
            setPlayerStats((prev) => ({
              ...prev,
              exp: prev.exp + task.expReward,
              mp: Math.min(100, prev.mp + 10),
            }));
          }

          return updated;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    setTasks(tasks.map((task) => (task.id === id ? { ...task, title: editTitle } : task)));
    setEditingId(null);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter((task) => categoryFilter === 'all' || task.category === categoryFilter)
      .sort((a, b) => {
        // Priority sort
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Completed sort
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        // Date sort
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, filter, categoryFilter]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
    totalExp: tasks.reduce((sum, t) => sum + (t.completed ? t.expReward : 0), 0),
  };

  const categoryStats = Object.entries(CATEGORY_COLORS).reduce(
    (acc, [cat]) => {
      acc[cat] = {
        total: tasks.filter((t) => t.category === cat).length,
        completed: tasks.filter((t) => t.category === cat && t.completed).length,
      };
      return acc;
    },
    {} as Record<string, { total: number; completed: number }>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ARYAN'S SYSTEM
            </h1>
            <p className="text-cyan-300 text-lg">Task Management & Life Gamification</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowScheduleView(!showScheduleView)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Clock size={18} /> {showScheduleView ? 'Tasks' : 'Schedule'}
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <TrendingUp size={18} /> Stats
            </button>
          </div>
        </div>

        {/* Player Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Award size={20} className="text-cyan-400" />
              <span className="text-gray-400 text-sm">LEVEL</span>
            </div>
            <div className="text-3xl font-black text-cyan-400">{playerStats.level}</div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={20} className="text-green-400" />
              <span className="text-gray-400 text-sm">EXP</span>
            </div>
            <div className="text-3xl font-black text-green-400">{playerStats.exp}</div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity size={20} className="text-red-400" />
              <span className="text-gray-400 text-sm">HP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 rounded h-2">
                <div className="bg-red-500 h-full rounded" style={{ width: `${playerStats.hp}%` }}></div>
              </div>
              <span className="text-red-400 font-bold text-sm">{playerStats.hp}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-blue-400" />
              <span className="text-gray-400 text-sm">MP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 rounded h-2">
                <div className="bg-blue-500 h-full rounded" style={{ width: `${playerStats.mp}%` }}></div>
              </div>
              <span className="text-blue-400 font-bold text-sm">{playerStats.mp}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-yellow-400" />
              <span className="text-gray-400 text-sm">STREAK</span>
            </div>
            <div className="text-3xl font-black text-yellow-400">{playerStats.streak}</div>
          </div>
        </div>

        {/* Stats View */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(CATEGORY_COLORS).map(([cat, colors]) => (
              <div key={cat} className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4`}>
                <div className="text-2xl mb-2">{colors.icon}</div>
                <h3 className={`font-bold ${colors.text} mb-2`}>{cat}</h3>
                <p className="text-gray-700 text-sm">
                  {categoryStats[cat].completed}/{categoryStats[cat].total} Complete
                </p>
                <div className="w-full bg-gray-300 rounded h-2 mt-2">
                  <div
                    className={colors.border.replace('border-', 'bg-')}
                    style={{
                      width: `${
                        categoryStats[cat].total === 0
                          ? 0
                          : (categoryStats[cat].completed / categoryStats[cat].total) * 100
                      }%`,
                    }}
                    className="h-full rounded transition"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule View */}
        {showScheduleView && (
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-6 mb-8 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Daily Schedule</h2>
            <div className="space-y-2">
              {DEFAULT_SCHEDULE.map((item) => {
                const colors = CATEGORY_COLORS[item.module];
                return (
                  <div key={item.id} className={`${colors.bg} ${colors.border} border-l-4 p-3 rounded`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-bold ${colors.text}`}>{item.title}</p>
                        <p className="text-gray-600 text-sm">
                          {item.time} - {item.endTime}
                        </p>
                      </div>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded font-bold text-sm">
                        +{item.exp} EXP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">TOTAL TASKS</p>
            <p className="text-3xl font-black text-cyan-400">{stats.total}</p>
          </div>
          <div className="bg-slate-700/50 border border-green-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">COMPLETED</p>
            <p className="text-3xl font-black text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-slate-700/50 border border-orange-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">ACTIVE</p>
            <p className="text-3xl font-black text-orange-400">{stats.active}</p>
          </div>
          <div className="bg-slate-700/50 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">COMPLETION</p>
            <p className="text-3xl font-black text-yellow-400">
              {stats.total === 0 ? '0%' : Math.round((stats.completed / stats.total) * 100) + '%'}
            </p>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center gap-2">
            <Plus size={24} /> Add New Task
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task Title (e.g., Complete Gym Session)"
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <input
              type="text"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="Description (optional)"
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as any)}
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_COLORS[cat].icon} {cat}
                </option>
              ))}
            </select>

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <input
              type="number"
              value={newTaskExp}
              onChange={(e) => setNewTaskExp(Number(e.target.value))}
              placeholder="EXP Reward"
              min="10"
              max="500"
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />

            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            />

            <input
              type="time"
              value={newTaskDueTime}
              onChange={(e) => setNewTaskDueTime(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Create Task
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700/50 border border-slate-600 text-gray-300 hover:border-cyan-500'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'active'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700/50 border border-slate-600 text-gray-300 hover:border-orange-500'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-slate-700/50 border border-slate-600 text-gray-300 hover:border-green-500'
            }`}
          >
            Completed ({stats.completed})
          </button>

          <div className="flex-1"></div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORY_COLORS).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-12 text-center">
              <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400 opacity-50" />
              <p className="text-gray-400 text-lg">
                {filter === 'all'
                  ? 'No tasks yet. Create your first quest!'
                  : `No ${filter} tasks found.`}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const colors = CATEGORY_COLORS[task.category];
              const priorityColor = PRIORITY_COLORS[task.priority];
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

              return (
                <div
                  key={task.id}
                  className={`${colors.bg} ${colors.border} border-l-4 rounded-lg p-4 transition hover:shadow-lg ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 mt-1"
                    >
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                          task.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-400 hover:border-green-500'
                        }`}
                      >
                        {task.completed && <Check size={16} className="text-white" />}
                      </div>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 bg-white text-black px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(task.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition"
                          >
                            <Save size={18} />
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`text-lg font-semibold mb-2 ${
                            task.completed
                              ? 'line-through text-gray-500'
                              : colors.text
                          }`}
                        >
                          {task.title}
                        </p>
                      )}

                      {task.description && !task.completed && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`${priorityColor.bg} ${priorityColor.text} text-xs font-bold px-2 py-1 rounded`}>
                          {task.priority.toUpperCase()}
                        </span>

                        {task.dueDate && (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${
                              isOverdue
                                ? 'bg-red-200 text-red-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}

                        {task.dueTime && (
                          <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                            <Clock size={12} />
                            {task.dueTime}
                          </span>
                        )}

                        <span className="bg-gradient-to-r from-yellow-300 to-orange-300 text-black text-xs font-bold px-2 py-1 rounded ml-auto">
                          +{task.expReward} EXP
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {editingId !== task.id && (
                        <button
                          onClick={() => startEditing(task)}
                          className="text-blue-500 hover:text-blue-700 transition p-2"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 transition p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
