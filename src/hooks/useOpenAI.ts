import { useState, useCallback } from 'react';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`;

const edgeFunctionHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export interface OpenAIConfig {
  isValid: boolean;
}

export interface GestureAnalysisResult {
  recognized: boolean;
  gesture?: string;
  confidence: number;
  feedback: string;
  suggestions?: string[];
}

export const useOpenAI = () => {
  const [config] = useState<OpenAIConfig>({ isValid: true });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeGesture = useCallback(async (
    imageData: string,
    expectedGesture: string
  ): Promise<GestureAnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: edgeFunctionHeaders,
        body: JSON.stringify({
          action: 'analyze-gesture',
          payload: { imageData, expectedGesture },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 500 && errData.error?.includes('not configured')) {
          throw new Error('Gesture recognition is not available. Please contact the administrator.');
        }
        throw new Error(errData.error || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        recognized: result.recognized || false,
        gesture: result.gesture || 'unknown',
        confidence: result.confidence || 0,
        feedback: result.feedback || 'No feedback available',
        suggestions: result.suggestions || [],
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze gesture';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    config,
    isAnalyzing,
    error,
    analyzeGesture,
  };
};
