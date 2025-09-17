import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  username: string;
  apiKey: string;
}

export interface AuthConfig {
  isAuthenticated: boolean;
  user: AuthUser | null;
  apiKey: string;
}

export const useAuth = () => {
  const [config, setConfig] = useState<AuthConfig>({
    isAuthenticated: false,
    user: null,
    apiKey: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('auslan_auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setConfig(session);
      } catch {
        localStorage.removeItem('auslan_auth_session');
      }
    }
  }, []);

  // Save session to localStorage when config changes
  useEffect(() => {
    if (config.isAuthenticated && config.user) {
      localStorage.setItem('auslan_auth_session', JSON.stringify(config));
    } else {
      localStorage.removeItem('auslan_auth_session');
    }
  }, [config]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoggingIn(true);
    setError(null);

    try {
      console.log('Attempting login for:', username);
      
      // Call our edge function for authentication using Supabase client
      const { data: result, error: functionError } = await supabase.functions.invoke('auth-login', {
        body: { username, password },
      });

      console.log('Function result:', result);
      console.log('Function error:', functionError);

      if (functionError) {
        console.error('Function error details:', {
          name: functionError.name,
          message: functionError.message,
          context: functionError.context
        });
        
        // Try to get more details from the error
        if (functionError.context && functionError.context.response) {
          console.error('Response details:', functionError.context.response);
        }
        
        throw new Error(functionError.message || 'Login failed');
      }

      if (result && result.success) {
        const authConfig: AuthConfig = {
          isAuthenticated: true,
          user: {
            id: result.user.id,
            username: result.user.username,
            apiKey: result.user.apiKey
          },
          apiKey: result.user.apiKey
        };
        
        setConfig(authConfig);
        return { success: true };
      } else {
        throw new Error(result?.message || 'Wrong username or password');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    setConfig({
      isAuthenticated: false,
      user: null,
      apiKey: ''
    });
    setError(null);
  }, []);

  return {
    config,
    isLoggingIn,
    error,
    login,
    logout,
    setError
  };
};