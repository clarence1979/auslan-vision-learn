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
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  AlertCircle, 
  CheckCircle, 
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { useRunware } from '@/hooks/useRunware';
import { AUSLAN_GESTURES } from '@/data/gestures';
import { useToast } from '@/hooks/use-toast';

interface ImageGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesGenerated?: (images: Array<{ gesture: string; imageURL: string }>) => void;
}

export const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({
  open,
  onOpenChange,
  onImagesGenerated
}) => {
  const { toast } = useToast();
  const { config, setApiKey, generateMultipleGestures, isGenerating } = useRunware();
  
  const [tempApiKey, setTempApiKey] = useState(config.apiKey);
  const [generatedImages, setGeneratedImages] = useState<Array<{ gesture: string; imageURL: string }>>([]);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('alphabet');

  const handleGenerateImages = async () => {
    if (!config.isValid) {
      toast({
        title: "API key required",
        description: "Please enter a valid Runware API key first.",
        variant: "destructive"
      });
      return;
    }

    const gesturesToGenerate = AUSLAN_GESTURES.filter(g => 
      selectedCategory === 'all' || g.category === selectedCategory
    ).slice(0, 5); // Limit to 5 for demo

    try {
      setProgress(0);
      setGeneratedImages([]);

      const results = await generateMultipleGestures(
        gesturesToGenerate.map(g => ({
          name: g.name,
          instructions: g.instructions,
          category: g.category
        }))
      );

      setGeneratedImages(results);
      setProgress(100);
      
      if (onImagesGenerated) {
        onImagesGenerated(results);
      }

      toast({
        title: "Images generated successfully!",
        description: `Generated ${results.length} gesture images.`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate images",
        variant: "destructive"
      });
    }
  };

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "API key required",
        description: "Please enter your Runware API key.",
        variant: "destructive"
      });
      return;
    }
    setApiKey(tempApiKey);
    toast({
      title: "API key saved",
      description: "You can now generate gesture images.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Generate Gesture Images
          </DialogTitle>
          <DialogDescription>
            Generate visual demonstrations for AUSLAN gestures using AI
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This project isn't connected to Supabase. For production use, we recommend{' '}
                <a 
                  href="#" 
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Connect to Supabase",
                      description: "Use the Supabase integration in your project settings.",
                    });
                  }}
                >
                  connecting to Supabase
                </a> to securely store API keys.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="runware-key">Runware API Key</Label>
              <Input
                id="runware-key"
                type="password"
                placeholder="Enter your Runware API key..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://runware.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  runware.ai
                </a>
                {' '}dashboard
              </p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                {config.isValid ? (
                  <Badge variant="default" className="bg-success text-success-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not configured
                  </Badge>
                )}
              </div>
            </div>

            <Button
              onClick={handleSaveApiKey}
              disabled={!tempApiKey.trim()}
              className="w-full"
            >
              Save API Key
            </Button>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <Label>Category to Generate</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="alphabet">Alphabet (A-E)</option>
                <option value="numbers">Numbers (1-5)</option>
                <option value="greetings">Greetings</option>
                <option value="common">Common Words</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Limited to 5 gestures per generation for demo purposes
              </p>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Generating gesture images...
                </p>
              </div>
            )}

            <Button
              onClick={handleGenerateImages}
              disabled={!config.isValid || isGenerating}
              className="w-full"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Images"}
            </Button>

            {generatedImages.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Generated Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.imageURL}
                          alt={`AUSLAN gesture for ${item.gesture}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{item.gesture}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = item.imageURL;
                            a.download = `auslan-${item.gesture.toLowerCase()}.webp`;
                            a.click();
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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