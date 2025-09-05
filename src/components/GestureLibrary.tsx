import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Play, BookOpen, Wand2 } from 'lucide-react';
import { AUSLAN_GESTURES, GESTURE_CATEGORIES, Gesture } from '@/data/gestures';
import { useProgress } from '@/hooks/useProgress';
import { ImageGenerationModal } from '@/components/ImageGenerationModal';

interface GestureLibraryProps {
  onGestureSelect: (gesture: Gesture) => void;
  selectedGesture?: Gesture;
}

export const GestureLibrary: React.FC<GestureLibraryProps> = ({
  onGestureSelect,
  selectedGesture
}) => {
  const { getGestureProgress, getMasteredCount } = useProgress();
  const [activeCategory, setActiveCategory] = useState('alphabet');
  const [showImageGeneration, setShowImageGeneration] = useState(false);
  const [gestureImages, setGestureImages] = useState<Record<string, string>>({});

  const getGesturesByCategory = (category: string) => {
    return AUSLAN_GESTURES.filter(gesture => gesture.category === category);
  };

  const getProgressPercentage = (gesture: Gesture) => {
    const progress = getGestureProgress(gesture.id);
    if (!progress || progress.attempts === 0) return 0;
    return Math.round((progress.successes / progress.attempts) * 100);
  };

  const isMastered = (gesture: Gesture) => {
    const progress = getGestureProgress(gesture.id);
    return progress?.mastered || false;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = GESTURE_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || 'primary';
  };

  const handleImagesGenerated = (images: Array<{ gesture: string; imageURL: string }>) => {
    const imageMap: Record<string, string> = {};
    images.forEach(({ gesture, imageURL }) => {
      // Find the gesture by name and use its ID
      const gestureData = AUSLAN_GESTURES.find(g => g.name === gesture);
      if (gestureData) {
        imageMap[gestureData.id] = imageURL;
      }
    });
    setGestureImages(prev => ({ ...prev, ...imageMap }));
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-2xl font-bold">AUSLAN Gesture Library</h2>
          <Button
            onClick={() => setShowImageGeneration(true)}
            size="sm"
            variant="outline"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Images
          </Button>
        </div>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>{AUSLAN_GESTURES.length} total gestures</span>
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-success" />
            {getMasteredCount()} mastered
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {GESTURE_CATEGORIES.map(category => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {GESTURE_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {/* Category description */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>

            {/* Gesture grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getGesturesByCategory(category.id).map(gesture => {
                const progress = getProgressPercentage(gesture);
                const mastered = isMastered(gesture);
                const isSelected = selectedGesture?.id === gesture.id;
                const hasGeneratedImage = gestureImages[gesture.id];

                return (
                  <Card
                    key={gesture.id}
                    className={`relative cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onGestureSelect(gesture)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{gesture.name}</CardTitle>
                        {mastered && (
                          <Trophy className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* Gesture image or placeholder */}
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {hasGeneratedImage ? (
                          <img
                            src={gestureImages[gesture.id]}
                            alt={`AUSLAN gesture for ${gesture.name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold mb-1">{gesture.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {gesture.difficulty}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      {progress > 0 && (
                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                        </div>
                      )}

                      {/* Difficulty badge */}
                      <div className="flex justify-between items-center">
                        <Badge
                          variant={
                            gesture.difficulty === 'easy' ? 'default' :
                            gesture.difficulty === 'medium' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {gesture.difficulty}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open tutorial mode
                            }}
                          >
                            <BookOpen className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onGestureSelect(gesture);
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Image Generation Modal */}
      <ImageGenerationModal
        open={showImageGeneration}
        onOpenChange={setShowImageGeneration}
        onImagesGenerated={handleImagesGenerated}
      />
    </div>
  );
};