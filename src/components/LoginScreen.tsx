import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import auslanLogo from '@/assets/auslan-logo.png';
import digivecLogo from '@/assets/digivec_logo.png';

export const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoggingIn(true);

    try {
      const success = await login(username, password);

      if (!success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-enhanced flex items-center justify-center p-4">
      <div className="floating-element w-32 h-32 top-10 left-10 opacity-30" style={{animationDelay: '0s'}} />
      <div className="floating-element w-24 h-24 top-32 right-20 opacity-20" style={{animationDelay: '2s'}} />
      <div className="floating-element w-40 h-40 bottom-20 left-1/4 opacity-25" style={{animationDelay: '4s'}} />

      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={auslanLogo} alt="AUSLAN Vision Learn" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Welcome to AUSLAN Vision Learn</CardTitle>
          <CardDescription>Sign in to access the application</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoggingIn}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <a
              href="https://digitalvector.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img src={digivecLogo} alt="Digital Vector" className="h-12 w-auto mx-auto" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
