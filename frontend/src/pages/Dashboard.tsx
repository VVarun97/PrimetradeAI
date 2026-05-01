import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, Edit } from 'lucide-react';
import api from '../api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchTasks();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchTasks = async () => {
    try {
      // If admin, might want to see all tasks, but for now we just show /tasks
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await api.get('/tasks/all');
      setTasks(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await api.post('/tasks', { title: newTaskTitle, description: newTaskDesc });
      setNewTaskTitle('');
      setNewTaskDesc('');
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (task: Task) => {
    const nextStatus = task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending';
    try {
      await api.put(`/tasks/${task.id}`, { ...task, status: nextStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email} ({user?.role})</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Add New Task</h2>
          {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
          <form onSubmit={handleCreateTask} className="flex gap-4">
            <input
              type="text"
              placeholder="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
              className="flex-1 rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <Plus size={18} /> Add
            </button>
          </form>
        </div>

        {user?.role === 'admin' && (
          <div className="mb-4 flex gap-4">
            <button onClick={fetchTasks} className="rounded border px-4 py-2 text-sm hover:bg-gray-100">My Tasks</button>
            <button onClick={fetchAllTasks} className="rounded border px-4 py-2 text-sm hover:bg-gray-100">All Tasks (Admin)</button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col justify-between rounded-lg bg-white p-5 shadow-sm border border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{task.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleUpdateStatus(task)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
              No tasks found. Create one above!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
