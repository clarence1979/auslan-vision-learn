import { useCallback, useState } from 'react';

interface FingerDetectionResult {
  hasFingers: boolean;
  confidence: number;
  landmarkCount: number;
}

export const useFingerDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeHands = useCallback(() => {
    // Simple initialization - no external dependencies needed
    setIsInitialized(true);
  }, []);

  const detectFingers = useCallback(async (imageData: string): Promise<FingerDetectionResult> => {
    setIsAnalyzing(true);
    
    try {
      return new Promise<FingerDetectionResult>((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Analyze image for hand-like features
          const result = analyzeImageForHands(ctx, canvas.width, canvas.height);
          
          setIsAnalyzing(false);
          resolve(result);
        };

        img.onerror = () => {
          setIsAnalyzing(false);
          resolve({ hasFingers: false, confidence: 0, landmarkCount: 0 });
        };

        img.src = imageData;
      });
    } catch (error) {
      console.error('Finger detection error:', error);
      setIsAnalyzing(false);
      return { hasFingers: false, confidence: 0, landmarkCount: 0 };
    }
  }, []);

  // Analyze image for hand-like features using canvas pixel analysis
  const analyzeImageForHands = (ctx: CanvasRenderingContext2D, width: number, height: number): FingerDetectionResult => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let skinPixelCount = 0;
    let motionPixelCount = 0;
    let totalPixels = 0;
    
    // Define skin tone ranges (simplified)
    const skinTones = [
      { rMin: 95, rMax: 255, gMin: 40, gMax: 100, bMin: 20, bMax: 95 },   // Light skin
      { rMin: 45, rMax: 95, gMin: 20, gMax: 50, bMin: 5, bMax: 35 },      // Medium skin  
      { rMin: 20, rMax: 60, gMin: 10, gMax: 30, bMin: 5, bMax: 20 }       // Dark skin
    ];
    
    // Sample pixels (check every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      if (alpha > 200) { // Only count non-transparent pixels
        totalPixels++;
        
        // Check if pixel matches skin tone
        const isSkinTone = skinTones.some(tone => 
          r >= tone.rMin && r <= tone.rMax &&
          g >= tone.gMin && g <= tone.gMax &&
          b >= tone.bMin && b <= tone.bMax
        );
        
        if (isSkinTone) {
          skinPixelCount++;
        }
        
        // Check for motion/contrast (simplified edge detection)
        if (i > width * 4 && i < data.length - width * 4) {
          const prevR = data[i - width * 4];
          const nextR = data[i + width * 4];
          const contrast = Math.abs(r - prevR) + Math.abs(r - nextR);
          
          if (contrast > 50) {
            motionPixelCount++;
          }
        }
      }
    }
    
    // Calculate confidence based on skin tone percentage and edge detection
    const skinPercentage = totalPixels > 0 ? skinPixelCount / totalPixels : 0;
    const motionPercentage = totalPixels > 0 ? motionPixelCount / totalPixels : 0;
    
    // Require at least 5% skin-tone pixels and some edge definition for hand detection
    const hasSignificantSkinTone = skinPercentage > 0.05;
    const hasDefinedEdges = motionPercentage > 0.1;
    const hasFingers = hasSignificantSkinTone && hasDefinedEdges;
    
    // Confidence score combines both factors
    const confidence = hasFingers ? Math.min((skinPercentage * 10 + motionPercentage * 5), 1) : 0;
    
    console.log('Hand detection analysis:', {
      skinPercentage: skinPercentage.toFixed(3),
      motionPercentage: motionPercentage.toFixed(3),
      hasFingers,
      confidence: confidence.toFixed(3)
    });
    
    return {
      hasFingers,
      confidence,
      landmarkCount: hasFingers ? Math.floor(confidence * 21) : 0
    };
  };

  return {
    detectFingers,
    isAnalyzing,
    isInitialized,
    initializeHands
  };
};