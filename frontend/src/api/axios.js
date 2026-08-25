import axios from 'axios';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL;
  if (url && typeof url === 'string') {
    url = url.trim();
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    return `https://${url}`;
  }
  return import.meta.env.PROD
    ? 'https://backend-management-pi.vercel.app/api'
    : 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('task_manager_token');

  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('task_manager_token');
      localStorage.removeItem('task_manager_user');
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
