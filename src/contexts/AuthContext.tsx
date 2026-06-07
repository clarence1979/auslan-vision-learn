import React, { createContext, useContext, useState, useEffect } from 'react';
import { attemptAutoLogin, isInIframe } from '../utils/auto-login';

interface AuthUser {
  username: string;
  isAdmin: boolean;
  openaiKey?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setApiKeys: (keys: { openaiKey?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STANDALONE_SUPABASE_URL = 'https://qfitpwdrswvnbmzvkoyd.supabase.co';
const STANDALONE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaXRwd2Ryc3d2bmJtenZrb3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTc4NTIsImV4cCI6MjA3NjkzMzg1Mn0.owLaj3VrcyR7_LW9xMwOTTFQupbDKlvAlVwYtbidiNE';

async function manualLogin(username: string, password: string): Promise<{ authenticated: boolean; username?: string; isAdmin?: boolean; openaiKey?: string }> {
  try {
    const response = await fetch(
      `${STANDALONE_SUPABASE_URL}/rest/v1/users_login?username=eq.${encodeURIComponent(username)}&select=username,password`,
      {
        headers: {
          'apikey': STANDALONE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    const users = await response.json();

    if (users && users.length > 0 && users[0].password === password) {
      const secretsResponse = await fetch(
        `${STANDALONE_SUPABASE_URL}/rest/v1/secrets?key_name=eq.OPENAI_API_KEY&select=key_value`,
        {
          headers: {
            'apikey': STANDALONE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          }
        }
      );

      const secrets = await secretsResponse.json();
      const openaiKey = secrets && secrets.length > 0 ? secrets[0].key_value : undefined;

      return {
        authenticated: true,
        username: users[0].username,
        isAdmin: false,
        openaiKey,
      };
    }

    return { authenticated: false };
  } catch (error) {
    console.error('Login error:', error);
    return { authenticated: false };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const cached = localStorage.getItem('auth_user');
      if (cached) {
        const cachedUser: AuthUser = JSON.parse(cached);
        if (!cachedUser.openaiKey) {
          const storedKey = localStorage.getItem('VITE_OPENAI_API_KEY');
          if (storedKey) {
            cachedUser.openaiKey = storedKey;
            localStorage.setItem('auth_user', JSON.stringify(cachedUser));
          } else {
            const secretsResponse = await fetch(
              `${STANDALONE_SUPABASE_URL}/rest/v1/secrets?key_name=eq.OPENAI_API_KEY&select=key_value`,
              { headers: { 'apikey': STANDALONE_SUPABASE_ANON_KEY } }
            ).catch(() => null);
            if (secretsResponse?.ok) {
              const secrets = await secretsResponse.json().catch(() => []);
              if (secrets?.[0]?.key_value) {
                cachedUser.openaiKey = secrets[0].key_value;
                localStorage.setItem('auth_user', JSON.stringify(cachedUser));
              }
            }
          }
        }
        setUser(cachedUser);
        setIsLoading(false);
        return;
      }

      if (isInIframe()) {
        const authResult = await attemptAutoLogin();

        if (authResult.authenticated) {
          const userData: AuthUser = {
            username: authResult.username!,
            isAdmin: authResult.isAdmin || false,
            openaiKey: localStorage.getItem('VITE_OPENAI_API_KEY') || undefined,
          };
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        }
      }

      setIsLoading(false);
    };

    initAuth();

    const handleBeforeUnload = () => {
      if (isInIframe()) {
        localStorage.removeItem('auth_user');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await manualLogin(username, password);

    if (result.authenticated) {
      const userData: AuthUser = {
        username: result.username!,
        isAdmin: result.isAdmin!,
        openaiKey: result.openaiKey,
      };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('VITE_OPENAI_API_KEY');
    localStorage.removeItem('VITE_CLAUDE_API_KEY');
    localStorage.removeItem('VITE_GEMINI_API_KEY');
    localStorage.removeItem('VITE_REPLICATE_API_KEY');
    localStorage.removeItem('VITE_SUPABASE_URL');
    localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
  };

  const setApiKeys = (keys: { openaiKey?: string }) => {
    if (user && keys.openaiKey) {
      const updatedUser = { ...user, openaiKey: keys.openaiKey };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      setApiKeys
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
