import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import auslanLogo from '@/assets/auslan-logo.png';

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn, error, setError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    await login(username, password);
  };

  return (
    <div className="min-h-screen bg-enhanced flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="floating-element w-32 h-32 top-10 left-10 opacity-30" style={{animationDelay: '0s'}} />
      <div className="floating-element w-24 h-24 top-32 right-20 opacity-20" style={{animationDelay: '2s'}} />
      <div className="floating-element w-40 h-40 bottom-20 left-1/4 opacity-25" style={{animationDelay: '4s'}} />
      <div className="floating-element w-28 h-28 bottom-40 right-1/3 opacity-15" style={{animationDelay: '6s'}} />
      
      {/* Hero gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        <Card className="shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={auslanLogo} 
                alt="AUSLAN Vision Learn Logo" 
                className="h-16 w-16"
              />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">Welcome Back</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Sign in to access AUSLAN Vision Learn
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoggingIn}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoggingIn}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="text-xs space-y-1 font-mono">
                <div>Username: <span className="text-primary">demo_user</span></div>
                <div>Password: <span className="text-primary">password123</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};