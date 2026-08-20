import { createContext, useMemo, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('task_manager_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem('task_manager_token') || '');

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('task_manager_user', JSON.stringify(userData));
    localStorage.setItem('task_manager_token', authToken);
  };

  const register = (userData, authToken) => {
    login(userData, authToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('task_manager_user');
    localStorage.removeItem('task_manager_token');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
