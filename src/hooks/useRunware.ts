import { useState, useCallback, useRef } from 'react';
import { RunwareService, GenerateImageParams, GeneratedImage } from '@/services/runware';

export interface RunwareConfig {
  apiKey: string;
  isValid: boolean;
}

export const useRunware = () => {
  const [config, setConfig] = useState<RunwareConfig>({ apiKey: '', isValid: false });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<RunwareService | null>(null);

  const setApiKey = useCallback((apiKey: string) => {
    const isValid = apiKey.length > 10; // Basic validation
    setConfig({ apiKey, isValid });
    setError(null);
    
    // Disconnect previous service if exists
    if (serviceRef.current) {
      serviceRef.current.disconnect();
    }
    
    // Create new service if key is valid
    if (isValid) {
      serviceRef.current = new RunwareService(apiKey);
    }
  }, []);

  const generateGestureImage = useCallback(async (
    gestureName: string,
    instructions: string,
    category: string
  ): Promise<GeneratedImage> => {
    if (!config.isValid || !serviceRef.current) {
      throw new Error('Invalid Runware API key. Please configure your API key.');
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a detailed prompt for AUSLAN gesture
      const prompt = `Professional photograph of hands demonstrating AUSLAN (Australian Sign Language) gesture for "${gestureName}", ${instructions.toLowerCase()}, clean white background, proper lighting, educational style, clear hand position, realistic hands, high quality, detailed fingers, ${category} gesture, front view, instructional photography`;

      const result = await serviceRef.current.generateImage({
        positivePrompt: prompt,
        model: "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: 7,
        scheduler: "FlowMatchEulerDiscreteScheduler",
        strength: 0.8,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate gesture image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  const generateMultipleGestures = useCallback(async (
    gestures: Array<{ name: string; instructions: string; category: string }>
  ): Promise<Array<{ gesture: string; imageURL: string }>> => {
    if (!config.isValid || !serviceRef.current) {
      throw new Error('Invalid Runware API key. Please configure your API key.');
    }

    const results: Array<{ gesture: string; imageURL: string }> = [];
    
    for (const gesture of gestures) {
      try {
        const result = await generateGestureImage(gesture.name, gesture.instructions, gesture.category);
        results.push({
          gesture: gesture.name,
          imageURL: result.imageURL
        });
        
        // Small delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate image for ${gesture.name}:`, error);
      }
    }
    
    return results;
  }, [generateGestureImage, config]);

  return {
    config,
    isGenerating,
    error,
    setApiKey,
    generateGestureImage,
    generateMultipleGestures
  };
};