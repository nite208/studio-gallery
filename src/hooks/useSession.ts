import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

export interface UseSessionResult {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly login: (password: string) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly expireSession: () => void;
}

export function useSession(): UseSessionResult {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const data = await apiClient<{ authenticated: boolean }>('/api/auth/session');
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = useCallback(async (password: string): Promise<void> => {
    const data = await apiClient<{ authenticated: boolean }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setIsAuthenticated(data.authenticated);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient<{ authenticated: boolean }>('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      setIsAuthenticated(false);
    }
  }, []);

  const expireSession = useCallback((): void => {
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    expireSession,
  };
}
