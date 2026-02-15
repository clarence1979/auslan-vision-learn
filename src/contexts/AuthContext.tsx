import React, { createContext, useContext, useState, useEffect } from 'react';

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

const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

async function validateAuthToken(token: string, supabaseUrl: string, supabaseAnonKey: string) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/auth_tokens?token=eq.${token}&expires_at=gt.${new Date().toISOString()}&select=username,is_admin,expires_at`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        }
      }
    );

    const tokens = await response.json();

    if (tokens && tokens.length > 0) {
      return {
        username: tokens[0].username,
        isAdmin: tokens[0].is_admin,
      };
    }

    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

async function attemptAutoLogin(): Promise<{ authenticated: boolean; username?: string; isAdmin?: boolean; openaiKey?: string }> {
  if (!isInIframe()) {
    return { authenticated: false };
  }

  return new Promise((resolve) => {
    window.parent.postMessage({ type: 'REQUEST_API_VALUES' }, '*');

    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'API_VALUES_RESPONSE') {
        window.removeEventListener('message', handleMessage);

        const { authToken, SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY } = event.data.data;

        if (authToken && SUPABASE_URL && SUPABASE_ANON_KEY) {
          const validatedUser = await validateAuthToken(authToken, SUPABASE_URL, SUPABASE_ANON_KEY);

          if (validatedUser) {
            resolve({
              username: validatedUser.username,
              isAdmin: validatedUser.isAdmin,
              openaiKey: OPENAI_API_KEY,
              authenticated: true,
            });
            return;
          }
        }

        resolve({ authenticated: false });
      }
    };

    window.addEventListener('message', handleMessage);

    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      resolve({ authenticated: false });
    }, 2000);
  });
}

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
        setUser(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      const authResult = await attemptAutoLogin();

      if (authResult.authenticated) {
        const userData: AuthUser = {
          username: authResult.username!,
          isAdmin: authResult.isAdmin!,
          openaiKey: authResult.openaiKey,
        };
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
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
