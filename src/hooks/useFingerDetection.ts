import { useRef, useCallback, useState } from 'react';
import { Hands } from '@mediapipe/hands';

interface FingerDetectionResult {
  hasFingers: boolean;
  confidence: number;
  landmarkCount: number;
}

export const useFingerDetection = () => {
  const handsRef = useRef<Hands | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const initializeHands = useCallback(() => {
    if (handsRef.current || isInitialized) return;

    try {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0, // Use fastest model for efficiency
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      handsRef.current = hands;
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize MediaPipe Hands:', error);
    }
  }, [isInitialized]);

  const detectFingers = useCallback(async (imageData: string): Promise<FingerDetectionResult> => {
    if (!handsRef.current) {
      initializeHands();
      return { hasFingers: false, confidence: 0, landmarkCount: 0 };
    }

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

          let detectionResult: FingerDetectionResult = {
            hasFingers: false,
            confidence: 0,
            landmarkCount: 0
          };

          handsRef.current!.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const landmarks = results.multiHandLandmarks[0];
              
              // Check if we have sufficient landmarks for finger detection
              if (landmarks && landmarks.length >= 21) {
                // Calculate finger tip positions (indices 4, 8, 12, 16, 20)
                const fingerTips = [4, 8, 12, 16, 20].map(i => landmarks[i]);
                
                // Check if fingers are clearly visible (not clustered together)
                const spreadFactor = calculateFingerSpread(fingerTips);
                
                detectionResult = {
                  hasFingers: true,
                  confidence: spreadFactor,
                  landmarkCount: landmarks.length
                };
              }
            }
            
            setIsAnalyzing(false);
            resolve(detectionResult);
          });

          // Send image to MediaPipe
          handsRef.current!.send({ image: canvas });
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
  }, [initializeHands]);

  // Calculate how spread out the fingers are (higher = more distinct finger positions)
  const calculateFingerSpread = (fingerTips: any[]) => {
    if (fingerTips.length < 5) return 0;

    let totalDistance = 0;
    let pairCount = 0;

    // Calculate distances between all finger tip pairs
    for (let i = 0; i < fingerTips.length; i++) {
      for (let j = i + 1; j < fingerTips.length; j++) {
        const dx = fingerTips[i].x - fingerTips[j].x;
        const dy = fingerTips[i].y - fingerTips[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        totalDistance += distance;
        pairCount++;
      }
    }

    // Return average distance (normalized to 0-1 range)
    const avgDistance = totalDistance / pairCount;
    return Math.min(avgDistance * 2, 1); // Scale and cap at 1
  };

  return {
    detectFingers,
    isAnalyzing,
    isInitialized,
    initializeHands
  };
};