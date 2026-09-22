import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { api, getAccessToken, getStoredUser } from '../services/api';
import type { User } from '../types';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from AsyncStorage on startup
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const [token, storedUser] = await Promise.all([getAccessToken(), getStoredUser()]);
        if (isMounted) {
          if (token && storedUser) {
            setUser(storedUser);
          }
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, pass);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(name, email, pass);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
