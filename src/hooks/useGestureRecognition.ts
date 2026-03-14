import { useState, useCallback } from 'react';
import { CustomGesture } from './useCustomGestures';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`;

const edgeFunctionHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export interface RecognitionResult {
  recognizedGesture: string;
  confidence: number;
  suggestions?: string[];
}

export const useGestureRecognition = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);

  const recognizeCustomGesture = useCallback(async (
    imageData: string,
    trainedGestures: CustomGesture[]
  ): Promise<RecognitionResult> => {
    if (trainedGestures.length === 0) {
      throw new Error('No trained gestures available. Please train some gestures first.');
    }

    setIsRecognizing(true);

    try {
      const gestureNames = trainedGestures.map(g => g.gesture_name).join(', ');

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: edgeFunctionHeaders,
        body: JSON.stringify({
          action: 'recognize-custom-gesture',
          payload: { imageData, gestureNames },
        }),
      });

      if (!response.ok) {
        throw new Error(`Recognition failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        recognizedGesture: result.recognizedGesture || 'unknown',
        confidence: result.confidence || 0,
        suggestions: result.suggestions || [],
      };
    } catch (err) {
      console.error('Recognition error:', err);
      throw err;
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  const buildSentence = useCallback(async (words: string[]): Promise<string> => {
    if (words.length === 0) return '';

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: edgeFunctionHeaders,
        body: JSON.stringify({
          action: 'build-sentence',
          payload: { words },
        }),
      });

      if (!response.ok) {
        return words.join(' ');
      }

      const data = await response.json();
      return data.sentence || words.join(' ');
    } catch (err) {
      console.error('Sentence building error:', err);
      return words.join(' ');
    }
  }, []);

  return {
    recognizeCustomGesture,
    buildSentence,
    isRecognizing,
  };
};
