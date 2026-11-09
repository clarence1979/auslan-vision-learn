import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import * as eduai from '@/lib/eduai';
import auslanLogo from '@/assets/auslan-logo.png';

// AUSLAN Vision Learn checks signs with AI, so it needs a teachingtools.dev sign-in. It never
// asks for a password: people sign in at teachingtools.dev, and this screen moves on by itself
// when they come back to the tab (or straight away inside the teachingtools.dev desktop).
export const LoginScreen: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkAgain = async () => {
    setChecking(true);
    await eduai.connect();
    setChecking(false);
    setChecked(true);
  };

  return (
    <div className="min-h-screen bg-enhanced flex items-center justify-center p-4">
      <div className="floating-element w-32 h-32 top-10 left-10 opacity-30" style={{ animationDelay: '0s' }} />
      <div className="floating-element w-24 h-24 top-32 right-20 opacity-20" style={{ animationDelay: '2s' }} />
      <div className="floating-element w-40 h-40 bottom-20 left-1/4 opacity-25" style={{ animationDelay: '4s' }} />
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={auslanLogo} alt="AUSLAN Vision Learn" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Sign in at teachingtools.dev</CardTitle>
          <CardDescription>
            AUSLAN Vision Learn uses AI to check your signs, so it needs your teachingtools.dev account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Open teachingtools.dev and sign in there.</li>
            <li>Come back to this tab. The app opens by itself.</li>
          </ol>
          <Button type="button" className="w-full" onClick={() => eduai.openSignIn()}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open teachingtools.dev
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={checkAgain} disabled={checking}>
            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            I've signed in. Check again
          </Button>
          {checked && (
            <Alert role="status">
              <AlertDescription>No sign-in found yet. Make sure you signed in at teachingtools.dev in this same browser.</AlertDescription>
            </Alert>
          )}
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-px" />
            This app never asks for your password, and no AI key is ever sent to it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
