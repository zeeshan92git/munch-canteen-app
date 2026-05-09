import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });

    // Use optional chaining and fallbacks to prevent the crash
    const responseData = res.data?.data || res.data;
    const accessToken = responseData?.access_token;
    const refreshToken = responseData?.refresh_token;

    if (!accessToken) {
      console.error("Access token not found in:", responseData);
      throw new Error("Token missing from server response");
    }

    // Save tokens
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Now try the profile fetch
    try {
      const userRes = await authAPI.getMe();
      console.log("User Profile Response:", userRes.data);

      const userData = userRes.data?.data || userRes.data;

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      console.error("Failed to fetch /auth/me:", err);
      throw err;
    }
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
