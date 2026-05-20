import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check, X, Edit2, Save } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  createdAt: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue,
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: new Date().toISOString(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
    setDueDate('');
    setPriority('medium');
    setCategory('General');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: string) => {
    if (editText.trim() === '') return;
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityTextColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Tasks</h1>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600 text-sm">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-gray-600 text-sm">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
            <div className="text-gray-600 text-sm">Active</div>
          </div>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new task..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Work"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition duration-200"
            >
              <Plus size={20} /> Add Task
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Completed ({stats.completed})
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 text-lg">
                {filter === 'all'
                  ? 'No tasks yet. Create one to get started!'
                  : `No ${filter} tasks.`}
              </p>
            </div>
          ) : (
            filteredTodos.sort((a, b) => {
              // Sort by priority (high > medium > low) then by date created
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return (priorityOrder[b.priority] - priorityOrder[a.priority]) ||
                     (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }).map(todo => (
              <div
                key={todo.id}
                className={`bg-white rounded-lg shadow p-4 border-l-4 ${getPriorityColor(
                  todo.priority
                )} transition hover:shadow-md ${todo.completed ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                        todo.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && <Check size={16} className="text-white" />}
                    </div>
                  </button>

                  {/* Todo Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-2 rounded transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p
                          className={`text-lg font-medium ${
                            todo.completed
                              ? 'line-through text-gray-500'
                              : 'text-gray-800'
                          }`}
                        >
                          {todo.text}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getPriorityTextColor(todo.priority)} bg-opacity-20 bg-${todo.priority === 'high' ? 'red' : todo.priority === 'medium' ? 'yellow' : 'green'}-100`}>
                            {todo.priority.toUpperCase()}
                          </span>
                          {todo.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {todo.category}
                            </span>
                          )}
                          {todo.dueDate && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                              {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {editingId !== todo.id && (
                      <button
                        onClick={() => startEditing(todo)}
                        className="text-blue-600 hover:text-blue-800 transition p-2"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-800 transition p-2"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>
              Productivity Progress: {stats.completed} of {stats.total} tasks completed
              {stats.total > 0 && ` (${Math.round((stats.completed / stats.total) * 100)}%)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
