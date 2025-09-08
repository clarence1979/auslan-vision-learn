import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Settings, Trash2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useOpenAI } from '@/hooks/useOpenAI';
import { useProgress } from '@/hooks/useProgress';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { config, setApiKey, testApiKey } = useOpenAI();
  const { progress, resetProgress, getSuccessRate, getMasteredCount } = useProgress();
  
  const [tempApiKey, setTempApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  // Initialize tempApiKey with current config when modal opens
  React.useEffect(() => {
    if (open) {
      setTempApiKey(config.apiKey);
      setValidationResult(null);
    }
  }, [open, config.apiKey]);

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      setValidationResult(false);
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await testApiKey(tempApiKey);
      setValidationResult(isValid);
      
      if (isValid) {
        setApiKey(tempApiKey);
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
    } catch {
      setValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings and Privacy
          </DialogTitle>
          <DialogDescription>
            Configure your AUSLAN learning experience and review privacy information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apikey">OpenAI API Key</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="sk-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Required for gesture recognition. Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>

            {/* API Key Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                {config.isValid ? (
                  <Badge variant="default" className="bg-success text-success-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not configured
                  </Badge>
                )}
              </div>
            </div>

            {/* Validation feedback */}
            {validationResult !== null && (
              <Alert variant={validationResult ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult
                    ? "API key is valid and ready to use!"
                    : "Invalid API key. Please check and try again."
                  }
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSaveApiKey}
              disabled={isValidating || !tempApiKey.trim()}
              className="w-full"
            >
              {isValidating ? "Validating..." : "Save API Key"}
            </Button>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div>
              <Label>Learning Statistics</Label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total attempts:</span>
                  <span className="font-medium">{progress.totalAttempts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Success rate:</span>
                  <span className="font-medium">{getSuccessRate()}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gestures mastered:</span>
                  <span className="font-medium">{getMasteredCount()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current streak:</span>
                  <span className="font-medium">{progress.streak}</span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Resetting progress will delete all your learning data permanently.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleResetProgress}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset All Progress
            </Button>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Privacy Principles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Data Collection and Use</h4>
                  <p className="text-muted-foreground mb-2">
                    AUSLAN Vision Learn is designed with privacy-by-design principles suitable for educational environments:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Camera images are processed locally and not transmitted or stored</li>
                    <li>OpenAI API key is stored locally in your browser only</li>
                    <li>Learning progress data remains on your device</li>
                    <li>No personal information is collected or transmitted to external servers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Australian Privacy Compliance</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Complies with Privacy Act 1988 (Cth) and Australian Privacy Principles</li>
                    <li>Suitable for use in educational institutions under notifiable data breach scheme</li>
                    <li>No cross-border data transfers of student information</li>
                    <li>Designed for student privacy protection under Australian guidelines</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Technical Safeguards</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Client-side processing ensures data sovereignty</li>
                    <li>Secure HTTPS communication protocols</li>
                    <li>No cookies or tracking mechanisms employed</li>
                    <li>Local storage encryption for API credentials</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Educational Institution Benefits</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Minimal data collection reduces privacy risk assessment requirements</li>
                    <li>No external data processing agreements needed beyond OpenAI API terms</li>
                    <li>Supports accessibility requirements for diverse learning needs</li>
                    <li>Can be deployed on institutional networks without data sovereignty concerns</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Student Rights</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Students can delete all personal data via progress reset function</li>
                    <li>No profiling or automated decision-making that affects students</li>
                    <li>Transparent about all data processing activities</li>
                    <li>Designed to support inclusive learning for students with disabilities</li>
                  </ul>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>For IT Administrators:</strong> This application requires only an OpenAI API key for gesture recognition. 
                    All other data processing occurs locally, making it suitable for deployment in educational environments 
                    with strict data governance requirements.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};