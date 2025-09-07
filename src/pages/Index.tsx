import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  BookOpen, 
  Play, 
  Trophy, 
  Camera as CameraIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

import { Camera } from '@/components/Camera';
import { GestureLibrary } from '@/components/GestureLibrary';
import { SettingsModal } from '@/components/SettingsModal';
import { useOpenAI } from '@/hooks/useOpenAI';
import { useProgress } from '@/hooks/useProgress';
import { useFingerDetection } from '@/hooks/useFingerDetection';
import { Gesture } from '@/data/gestures';

const Index = () => {
  console.log('Index component rendering');
  
  const { toast } = useToast();
  const { config, analyzeGesture, isAnalyzing, error } = useOpenAI();
  const { recordAttempt, getSuccessRate, getMasteredCount } = useProgress();
  const { detectFingers, isAnalyzing: isDetectingFingers, initializeHands } = useFingerDetection();
  
  const [activeMode, setActiveMode] = useState<'learn' | 'practice'>('learn');
  const [selectedGesture, setSelectedGesture] = useState<Gesture | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleGestureCapture = async (imageData: string) => {
    console.log('=== GESTURE ANALYSIS START ===');
    console.log('Received image data length:', imageData.length);
    
    if (!selectedGesture) {
      console.log('No gesture selected');
      toast({
        title: "No gesture selected",
        description: "Please select a gesture to practice first.",
        variant: "destructive"
      });
      return;
    }

    if (!config.isValid) {
      console.log('Config invalid:', config);
      toast({
        title: "API key required",
        description: "Please configure your OpenAI API key in settings.",
        variant: "destructive"
      });
      setShowSettings(true);
      return;
    }

    console.log('Starting finger detection...');

    try {
      // First, detect if fingers are present in the image
      const fingerResult = await detectFingers(imageData);
      console.log('Finger detection result:', fingerResult);

      if (!fingerResult.hasFingers || fingerResult.confidence < 0.3) {
        console.log('No fingers detected or low confidence:', fingerResult.confidence);
        toast({
          title: "No hands detected",
          description: "Please position your hand clearly in the camera view with fingers visible.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fingers detected! Starting OpenAI analysis for gesture:', selectedGesture.name);
      
      // Only proceed with OpenAI analysis if fingers are detected
      const result = await analyzeGesture(imageData, selectedGesture.name);
      console.log('Analysis result:', result);
      setLastResult(result);
      
      // Record the attempt
      recordAttempt(selectedGesture.id, result.recognized);
      
      // Show feedback
      toast({
        title: result.recognized ? "Great job!" : "Keep practicing!",
        description: result.feedback,
        variant: result.recognized ? "default" : "destructive"
      });
      
    } catch (err) {
      console.error('Analysis failed:', err);
      toast({
        title: "Analysis failed",
        description: err instanceof Error ? err.message : "Failed to analyze gesture",
        variant: "destructive"
      });
    }
    console.log('=== GESTURE ANALYSIS END ===');
  };

  const handleGestureSelect = (gesture: Gesture) => {
    setSelectedGesture(gesture);
    setLastResult(null);
    setActiveMode('practice');
    // Initialize finger detection when starting practice
    initializeHands();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary">AUSLAN Vision Learn</h1>
                <p className="text-sm text-muted-foreground">
                  Learn Australian Sign Language with AI-powered gesture recognition
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Proudly made by:</span>
                <a 
                  href="https://clarence.guru" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/lovable-uploads/a349d04b-5577-4c13-bf4e-5316c1e5782e.png" 
                    alt="Clarence's Solutions" 
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-success" />
                  <span>{getMasteredCount()} mastered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Success rate: {getSuccessRate()}%</span>
                </div>
              </div>
              
              {/* PayPal Donation Button */}
              <form action="https://www.paypal.com/donate" method="post" target="_top" className="flex items-center">
                <input type="hidden" name="hosted_button_id" value="PSXE6LDM3ZJDC" />
                <input 
                  type="image" 
                  src="https://www.paypalobjects.com/en_AU/i/btn/btn_donateCC_LG.gif" 
                  style={{border: 0}} 
                  name="submit" 
                  title="PayPal - The safer, easier way to pay online!" 
                  alt="Donate with PayPal button" 
                  className="h-10 hover:opacity-80 transition-opacity"
                />
                <img 
                  alt="" 
                  style={{border: 0}} 
                  src="https://www.paypal.com/en_AU/i/scr/pixel.gif" 
                  width={1} 
                  height={1} 
                />
              </form>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* API Key Warning */}
        {!config.isValid && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>OpenAI API key required for gesture recognition.</span>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                Configure
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'learn' | 'practice')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learn Gestures
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Practice Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn">
            <GestureLibrary
              onGestureSelect={handleGestureSelect}
              selectedGesture={selectedGesture}
            />
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            {selectedGesture ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Camera and controls */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CameraIcon className="h-5 w-5" />
                        Practice: {selectedGesture.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Camera 
                        onCapture={selectedGesture ? handleGestureCapture : undefined}
                        autoCapture={!!selectedGesture}
                        captureInterval={3000}
                      />
                      
                      {/* Stop Camera Button */}
                      <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            // Stop camera and clear selection
                            setSelectedGesture(null);
                            setLastResult(null);
                            setActiveMode('learn');
                          }}
                          className="flex items-center gap-2"
                        >
                          <CameraIcon className="h-4 w-4" />
                          Stop Camera
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gesture info and feedback */}
                <div className="space-y-4">
                  {/* Current gesture info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Gesture</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                       <div className="text-center">
                         <div className="text-4xl font-bold mb-2">{selectedGesture.name}</div>
                         <Badge className="mb-4">
                           {selectedGesture.category}
                         </Badge>
                         
                         {/* Visual guide image */}
                         {selectedGesture.imageUrl && (
                           <div className="mb-4">
                             <img
                               src={selectedGesture.imageUrl}
                               alt={`Visual guide for AUSLAN gesture ${selectedGesture.name}`}
                               className="mx-auto w-32 h-32 object-cover rounded-lg border"
                             />
                           </div>
                         )}
                         
                         <p className="text-sm text-muted-foreground mb-4">
                           {selectedGesture.description}
                         </p>
                         <div className="bg-accent rounded-lg p-4">
                           <p className="text-sm font-medium">Instructions:</p>
                           <p className="text-sm">{selectedGesture.instructions}</p>
                         </div>
                       </div>
                     </CardContent>
                  </Card>

                  {/* Feedback */}
                  {lastResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {lastResult.recognized ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          )}
                          Analysis Result
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Confidence:</span>
                          <Badge variant={lastResult.confidence > 70 ? "default" : "secondary"}>
                            {lastResult.confidence}%
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Feedback:</p>
                          <p className="text-sm text-muted-foreground">{lastResult.feedback}</p>
                        </div>
                        
                        {lastResult.suggestions && lastResult.suggestions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Suggestions:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {lastResult.suggestions.map((suggestion: string, index: number) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Loading state */}
                  {(isAnalyzing || isDetectingFingers) && (
                    <Card>
                      <CardContent className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            {isDetectingFingers ? "Detecting hands..." : "Analyzing gesture..."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Ready to Practice!</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a gesture from the Learn tab to start practicing
                    </p>
                    <Button onClick={() => setActiveMode('learn')}>
                      Choose a Gesture
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};

export default Index;
