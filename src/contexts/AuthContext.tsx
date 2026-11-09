import React, { createContext, useContext, useEffect, useState } from 'react';
import * as eduai from '@/lib/eduai';

// The account comes from teachingtools.dev (see src/lib/eduai.ts): this app never asks for
// a password and never holds an AI key. openaiKey is a stand-in that makes AI requests go
// through the school's relay with a short-lived pass.

interface AuthUser {
  username: string;
  isAdmin: boolean;
  openaiKey?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
