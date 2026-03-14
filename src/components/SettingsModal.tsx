import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Trash2, CircleAlert as AlertCircle, Shield } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { progress, resetProgress, getSuccessRate, getMasteredCount } = useProgress();

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings and Privacy
          </DialogTitle>
          <DialogDescription>
            Configure your AUSLAN learning experience and review privacy information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

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
                    <li>Camera images are processed securely and not stored</li>
                    <li>Gesture recognition is powered by a secure backend service</li>
                    <li>Learning progress data remains on your device</li>
                    <li>No personal information is collected or transmitted</li>
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
                    <li>API keys are stored securely on the server, never exposed to the browser</li>
                    <li>Secure HTTPS communication protocols</li>
                    <li>No cookies or tracking mechanisms employed</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Educational Institution Benefits</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Minimal data collection reduces privacy risk assessment requirements</li>
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
                    <strong>For IT Administrators:</strong> This application uses a secure backend for gesture recognition.
                    All API credentials are stored server-side, making it suitable for deployment in educational environments
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
