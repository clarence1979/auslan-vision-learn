import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera } from './Camera';
import { useCustomGestures } from '@/hooks/useCustomGestures';
import {
  Camera as CameraIcon,
  Save,
  Trash2,
  AlertCircle,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const GestureTraining: React.FC = () => {
  const { toast } = useToast();
  const { gestures, isLoading, saveGesture, deleteGesture } = useCustomGestures();

  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [gestureName, setGestureName] = useState('');

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturing(false);
    toast({
      title: "Gesture captured!",
      description: "Now tell the computer what this gesture means."
    });
  };

  const handleSave = async () => {
    if (!gestureName.trim()) {
      toast({
        title: "Word required",
        description: "Please tell the computer what this gesture means.",
        variant: "destructive"
      });
      return;
    }

    if (!capturedImage) {
      toast({
        title: "No gesture",
        description: "Please capture a gesture first.",
        variant: "destructive"
      });
      return;
    }

    const success = await saveGesture(gestureName, capturedImage);

    if (success) {
      toast({
        title: "Gesture saved!",
        description: `"${gestureName}" has been added to your training data.`
      });

      setCapturedImage(null);
      setGestureName('');
      setIsCapturing(true);
    } else {
      toast({
        title: "Save failed",
        description: "Could not save gesture. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (gestureId: string, name: string) => {
    if (!confirm(`Delete gesture "${name}"?`)) return;

    const success = await deleteGesture(gestureId);

    if (success) {
      toast({
        title: "Deleted",
        description: `"${name}" has been removed.`
      });
    } else {
      toast({
        title: "Delete failed",
        description: "Could not delete gesture.",
        variant: "destructive"
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setGestureName('');
    setIsCapturing(true);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Learn by doing:</strong> Hand gestures are data! Train your own custom gestures and watch how the AI learns to recognize them.
          This demonstrates how personalized communication systems work for people who are deaf or speech-impaired.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CameraIcon className="h-5 w-5" />
                Record Gesture
              </CardTitle>
              <CardDescription>
                Step 1: Make a gesture → Step 2: Tell the computer what it means
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCapturing && !capturedImage && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                    <strong>Step 1:</strong> Make your gesture in front of the camera and click "Capture"
                  </div>
                  <Camera
                    onCapture={handleCapture}
                    autoCapture={false}
                  />
                </div>
              )}

              {capturedImage && !isCapturing && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
                    <strong>Step 2:</strong> Now tell the computer what this gesture means
                  </div>

                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured gesture"
                      className="w-full rounded-lg border-2 border-green-500"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Captured
                    </Badge>
                  </div>

                  <div>
                    <Label htmlFor="gesture-name" className="text-base">
                      What does this gesture mean?
                    </Label>
                    <Input
                      id="gesture-name"
                      placeholder="Type the word (e.g., hello, water, help, I, want)"
                      value={gestureName}
                      onChange={(e) => setGestureName(e.target.value)}
                      maxLength={50}
                      className="text-lg mt-2"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && gestureName.trim()) {
                          handleSave();
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || !gestureName.trim()}
                      className="flex-1"
                      size="lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save & Train Another
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRetake}
                      size="lg"
                    >
                      Retake
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Trained Gestures
                <Badge variant="secondary" className="ml-auto">
                  {gestures.length} gestures
                </Badge>
              </CardTitle>
              <CardDescription>
                Your personal gesture library for AI recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gestures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No gestures trained yet.</p>
                  <p className="text-sm">Start by capturing your first gesture!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {gestures.map((gesture) => (
                      <div key={gesture.id} className="relative group">
                        <Badge
                          variant="outline"
                          className="text-sm py-2 px-3 pr-8 cursor-default hover:bg-accent"
                        >
                          {gesture.gesture_name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gesture.id, gesture.gesture_name)}
                          className="absolute right-0 top-0 h-full px-2 text-destructive hover:text-destructive hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
