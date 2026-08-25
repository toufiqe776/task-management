import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import useAuth from '../hooks/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      });

      login(data.user, data.token);
      navigate('/');
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
        apiError.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Login to TaskFlow</h1>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-sky-500 focus:bg-white"
              placeholder="••••••••"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-sky-700 hover:text-sky-600">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
