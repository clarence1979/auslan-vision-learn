import React, { createContext, useContext, useEffect, useState } from 'react';
import * as eduai from '@/lib/eduai';

// Accounts and API keys now come from teachingtools.dev (see src/lib/eduai.ts).
// The old version read usernames, plain-text passwords and API keys straight
// out of a database that anyone on the internet could read.

interface AuthUser {
  username: string;
  isAdmin: boolean;
  openaiKey?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Throws an Error with a message to show if sign-in fails. */
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setApiKeys: (keys: { openaiKey?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(s: eduai.EduaiState): AuthUser | null {
  if (s.status !== 'ready' || !s.user) return null;
  return { username: s.user.username, isAdmin: s.user.isAdmin, openaiKey: s.keys.OPENAI_API_KEY || undefined };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<eduai.EduaiState>(eduai.getState());

  useEffect(() => {
    const unsubscribe = eduai.subscribe(setState);
    void eduai.connect();
    return unsubscribe;
  }, []);

  const user = toUser(state);

  const login = async (username: string, password: string): Promise<boolean> => {
    await eduai.login(username, password);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    void eduai.logout();
  };

  // Keys are managed by teachingtools.dev; kept for compatibility with older callers.
  const setApiKeys = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading: state.status === 'loading',
      login,
      logout,
      setApiKeys,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
