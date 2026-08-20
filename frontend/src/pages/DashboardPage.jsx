import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, LogOut, Plus, Search } from 'lucide-react';
import api from '../api/axios.js';
import TaskCard from '../components/TaskCard.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import useAuth from '../hooks/useAuth.js';
import useTasks from '../hooks/useTasks.js';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { data, isLoading, isError, error } = useTasks(filters, page);
  const tasks = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, lastPage: 1 };

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const handleTaskSubmit = async (formValues) => {
    const formData = new FormData();

    if (formValues.title) {
      formData.append('title', formValues.title.trim());
    }
    if (formValues.description) {
      formData.append('description', formValues.description.trim());
    }
    if (formValues.status) {
      formData.append('status', formValues.status);
    }
    if (formValues.priority) {
      formData.append('priority', formValues.priority);
    }
    if (formValues.location) {
      formData.append('location', formValues.location.trim());
    }
    if (formValues.dueDate) {
      formData.append('dueDate', formValues.dueDate);
    }
    if (formValues.file) {
      formData.append('file', formValues.file);
    }

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }

      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (submitError) {
      console.error('Failed to save task:', submitError.response?.data || submitError.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (deleteError) {
      console.error('Failed to delete task:', deleteError.response?.data || deleteError.message);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">Overview</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back, {user?.name || 'there'}!</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                <Plus size={16} />
                Add task
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 outline-none transition focus:border-sky-500 focus:bg-white"
                placeholder="Search tasks..."
              />
            </label>

            <select
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
            >
              <option value="">All statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>

            <select
              value={filters.priority}
              onChange={(event) => updateFilter('priority', event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
            >
              <option value="">All priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => updateFilter('startDate', event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => updateFilter('endDate', event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>
        </section>

        <section className="mb-6 flex items-center justify-between text-sm text-slate-600">
          <span>{meta.total} tasks</span>
          <span>Page {meta.page} of {meta.lastPage}</span>
        </section>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-600">
            {error?.response?.data?.message || 'Unable to load tasks.'}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-soft">
            <p className="text-lg font-semibold text-slate-700">No tasks found</p>
            <p className="mt-2 text-sm text-slate-500">Create your first task or adjust the current filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onDelete={handleDeleteTask} onEdit={openEditModal} />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(meta.lastPage, current + 1))}
            disabled={page >= meta.lastPage}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        initialValues={
          editingTask
            ? {
                title: editingTask.title || '',
                description: editingTask.description || '',
                status: editingTask.status || 'PENDING',
                priority: editingTask.priority || 'MEDIUM',
                dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
                location: editingTask.location || '',
              }
            : {}
        }
      />
    </div>
  );
};

export default DashboardPage;