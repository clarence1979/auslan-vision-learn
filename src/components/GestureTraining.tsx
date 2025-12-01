import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera } from './Camera';
import { useCustomGestures } from '@/hooks/useCustomGestures';
import {
  Camera as CameraIcon,
  Save,
  Trash2,
  Plus,
  AlertCircle,
  BookOpen,
  Sparkles
} from 'lucide-react';

export const GestureTraining: React.FC = () => {
  const { toast } = useToast();
  const { gestures, isLoading, saveGesture, deleteGesture } = useCustomGestures();

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [gestureName, setGestureName] = useState('');
  const [description, setDescription] = useState('');

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturing(false);
    toast({
      title: "Gesture captured!",
      description: "Now give it a name and save it."
    });
  };

  const handleSave = async () => {
    if (!gestureName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your gesture.",
        variant: "destructive"
      });
      return;
    }

    if (!capturedImage) {
      toast({
        title: "No image",
        description: "Please capture a gesture first.",
        variant: "destructive"
      });
      return;
    }

    const success = await saveGesture(gestureName, capturedImage, description);

    if (success) {
      toast({
        title: "Gesture saved!",
        description: `"${gestureName}" has been added to your training data.`
      });

      setCapturedImage(null);
      setGestureName('');
      setDescription('');
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

  const handleReset = () => {
    setCapturedImage(null);
    setGestureName('');
    setDescription('');
    setIsCapturing(false);
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
                <Plus className="h-5 w-5" />
                Train New Gesture
              </CardTitle>
              <CardDescription>
                Capture a hand gesture and teach the AI to recognize it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCapturing && !capturedImage && (
                <Button
                  onClick={() => setIsCapturing(true)}
                  className="w-full"
                  size="lg"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Start Capturing
                </Button>
              )}

              {isCapturing && (
                <div className="space-y-4">
                  <Camera
                    onCapture={handleCapture}
                    autoCapture={false}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setIsCapturing(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {capturedImage && !isCapturing && (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured gesture"
                      className="w-full rounded-lg border-2 border-primary"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Captured
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="gesture-name">Gesture Name*</Label>
                      <Input
                        id="gesture-name"
                        placeholder="e.g., hello, water, help"
                        value={gestureName}
                        onChange={(e) => setGestureName(e.target.value)}
                        maxLength={50}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        What word or concept does this gesture represent?
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Add notes about how to perform this gesture..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || !gestureName.trim()}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Gesture
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      Reset
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
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {gestures.map((gesture) => (
                    <Card key={gesture.id} className="overflow-hidden">
                      <div className="flex gap-3 p-3">
                        <img
                          src={gesture.image_data}
                          alt={gesture.gesture_name}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {gesture.gesture_name}
                          </h4>
                          {gesture.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {gesture.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(gesture.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gesture.id, gesture.gesture_name)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
