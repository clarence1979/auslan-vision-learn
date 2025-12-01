import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera } from './Camera';
import { useCustomGestures } from '@/hooks/useCustomGestures';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import {
  Camera as CameraIcon,
  MessageSquare,
  Trash2,
  PlayCircle,
  StopCircle,
  Wand2,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const SentenceBuilder: React.FC = () => {
  const { toast } = useToast();
  const { gestures } = useCustomGestures();
  const { recognizeCustomGesture, buildSentence, isRecognizing } = useGestureRecognition();

  const [isActive, setIsActive] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<string[]>([]);
  const [constructedSentence, setConstructedSentence] = useState('');
  const [lastRecognition, setLastRecognition] = useState<{
    word: string;
    confidence: number;
  } | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleGestureCapture = async (imageData: string) => {
    if (!isActive) return;

    try {
      const result = await recognizeCustomGesture(imageData, gestures);

      setLastRecognition({
        word: result.recognizedGesture,
        confidence: result.confidence
      });

      setRecognizedWords(prev => [...prev, result.recognizedGesture]);

      toast({
        title: "Gesture recognized!",
        description: `Added "${result.recognizedGesture}" (${result.confidence}% confidence)`,
      });
    } catch (err) {
      console.error('Recognition error:', err);
      toast({
        title: "Recognition failed",
        description: err instanceof Error ? err.message : "Could not recognize gesture",
        variant: "destructive"
      });
    }
  };

  const handleBuildSentence = async () => {
    if (recognizedWords.length === 0) {
      toast({
        title: "No words yet",
        description: "Perform some gestures first!",
        variant: "destructive"
      });
      return;
    }

    setIsBuilding(true);
    try {
      const sentence = await buildSentence(recognizedWords);
      setConstructedSentence(sentence);
      toast({
        title: "Sentence constructed!",
        description: "AI has filled in the gaps to create a complete sentence."
      });
    } catch (err) {
      toast({
        title: "Failed to build sentence",
        description: "Could not construct sentence from words.",
        variant: "destructive"
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const handleClearSentence = () => {
    setRecognizedWords([]);
    setConstructedSentence('');
    setLastRecognition(null);
    toast({
      title: "Cleared",
      description: "Ready for a new sentence!"
    });
  };

  const handleToggleActive = () => {
    if (gestures.length === 0) {
      toast({
        title: "No trained gestures",
        description: "Please train some gestures first in the Training tab.",
        variant: "destructive"
      });
      return;
    }

    setIsActive(!isActive);

    if (!isActive) {
      toast({
        title: "Recognition active",
        description: "Start performing your trained gestures!"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200">
        <Sparkles className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          <strong>Build complete sentences:</strong> Perform your trained gestures in sequence. The AI will recognize them and construct a complete, natural sentence -
          demonstrating how assistive communication technology helps people express themselves fluently.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CameraIcon className="h-5 w-5" />
                Gesture Recognition
                {isActive && (
                  <Badge className="ml-auto bg-green-500 animate-pulse">
                    ACTIVE
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Perform your trained gestures to build a sentence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gestures.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No trained gestures available. Please train some gestures first!
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleToggleActive}
                      className={isActive ? "flex-1 bg-red-500 hover:bg-red-600" : "flex-1"}
                    >
                      {isActive ? (
                        <>
                          <StopCircle className="h-4 w-4 mr-2" />
                          Stop Recognition
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Recognition
                        </>
                      )}
                    </Button>
                  </div>

                  {isActive && (
                    <Camera
                      onCapture={handleGestureCapture}
                      autoCapture={true}
                      captureInterval={3000}
                    />
                  )}

                  {lastRecognition && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-semibold text-lg">
                              {lastRecognition.word}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {lastRecognition.confidence}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isRecognizing && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Recognizing gesture...</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Available Gestures
                <Badge variant="secondary" className="ml-auto">
                  {gestures.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gestures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No gestures trained yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {gestures.map((gesture) => (
                    <Badge key={gesture.id} variant="outline" className="text-sm">
                      {gesture.gesture_name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recognized Words
                <Badge variant="secondary" className="ml-auto">
                  {recognizedWords.length} words
                </Badge>
              </CardTitle>
              <CardDescription>
                Words recognized from your gestures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recognizedWords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No words yet</p>
                  <p className="text-sm">Start performing gestures to build your sentence</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 p-4 bg-accent rounded-lg min-h-[80px]">
                    {recognizedWords.map((word, index) => (
                      <Badge key={index} className="text-base px-3 py-1">
                        {word}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleBuildSentence}
                      disabled={isBuilding || recognizedWords.length === 0}
                      className="flex-1"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      {isBuilding ? "Building..." : "Build Sentence"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearSentence}
                      disabled={recognizedWords.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {constructedSentence && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Constructed Sentence
                </CardTitle>
                <CardDescription>
                  AI-generated complete sentence with filled gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-lg font-medium leading-relaxed">
                    "{constructedSentence}"
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  The AI has intelligently filled in articles, prepositions, and connecting words
                  to create a natural, grammatically correct sentence from your gestures.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
