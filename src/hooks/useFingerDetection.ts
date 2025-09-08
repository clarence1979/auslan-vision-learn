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
    
    // More inclusive skin tone ranges
    const skinTones = [
      { rMin: 80, rMax: 255, gMin: 30, gMax: 120, bMin: 15, bMax: 110 },   // Light skin (more inclusive)
      { rMin: 40, rMax: 120, gMin: 15, gMax: 70, bMin: 5, bMax: 50 },      // Medium skin (wider range)
      { rMin: 15, rMax: 80, gMin: 8, gMax: 40, bMin: 3, bMax: 30 },        // Dark skin (more inclusive)
      { rMin: 100, rMax: 200, gMin: 50, gMax: 150, bMin: 40, bMax: 120 }   // Additional range for varied lighting
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
    
    // More realistic thresholds for hand detection
    const hasSignificantSkinTone = skinPercentage > 0.02; // Lowered from 5% to 2%
    const hasDefinedEdges = motionPercentage > 0.01; // Lowered from 10% to 1%
    const hasFingers = hasSignificantSkinTone || (skinPercentage > 0.015 && hasDefinedEdges); // More flexible logic
    
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