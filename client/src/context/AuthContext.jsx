import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spis_token');
    const savedUser = localStorage.getItem('spis_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    if (data.success) {
      localStorage.setItem('spis_token', data.token);
      localStorage.setItem('spis_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await API.post('/auth/register', { username, email, password });
    if (data.success) {
      localStorage.setItem('spis_token', data.token);
      localStorage.setItem('spis_user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('spis_token');
    localStorage.removeItem('spis_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
