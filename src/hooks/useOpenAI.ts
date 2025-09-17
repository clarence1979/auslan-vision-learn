import { useState, useCallback, useEffect } from 'react';

export interface OpenAIConfig {
  apiKey: string;
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
  const [config, setConfig] = useState<OpenAIConfig>(() => {
    try {
      const saved = localStorage.getItem('auslan-openai-config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const result = {
          apiKey: parsed.apiKey || '',
          isValid: parsed.apiKey?.startsWith('sk-') && parsed.apiKey?.length > 20
        };
        return result;
      }
      return { apiKey: '', isValid: false };
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
      return { apiKey: '', isValid: false };
    }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for localStorage changes and update config
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('auslan-openai-config');
        if (saved) {
          const parsed = JSON.parse(saved);
          const newConfig = {
            apiKey: parsed.apiKey || '',
            isValid: parsed.apiKey?.startsWith('sk-') && parsed.apiKey?.length > 20
          };
          setConfig(prevConfig => {
            // Only update if the config has actually changed
            if (prevConfig.apiKey !== newConfig.apiKey || prevConfig.isValid !== newConfig.isValid) {
              return newConfig;
            }
            return prevConfig;
          });
        }
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    };

    // Listen for storage events (from other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    window.addEventListener('auslan-config-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auslan-config-updated', handleStorageChange);
    };
  }, []);

  // Persist config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('auslan-openai-config', JSON.stringify(config));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('auslan-config-updated'));
  }, [config]);

  const setApiKey = useCallback((apiKey: string) => {
    const newConfig = { apiKey, isValid: apiKey.startsWith('sk-') && apiKey.length > 20 };
    setConfig(newConfig);
    setError(null);
  }, []);

  const analyzeGesture = useCallback(async (
    imageData: string, 
    expectedGesture: string,
    apiKey?: string
  ): Promise<GestureAnalysisResult> => {
    const keyToUse = apiKey || config.apiKey;
    const isKeyValid = keyToUse?.startsWith('sk-') && keyToUse.length > 20;
    
    if (!isKeyValid) {
      throw new Error('Invalid API key. Please configure your OpenAI API key.');
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an AUSLAN (Australian Sign Language) gesture recognition expert. Analyze the image and determine if the person is correctly performing the AUSLAN gesture for "${expectedGesture}". 

Respond with a JSON object containing:
- recognized: boolean (true if gesture is correct)
- gesture: string (what gesture you think is being shown)
- confidence: number (0-100, confidence in your assessment)
- feedback: string (encouraging feedback about the attempt)
- suggestions: array of strings (specific tips for improvement if needed)

Be encouraging and educational in your feedback. Consider hand position, finger placement, and overall gesture form.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Please analyze this AUSLAN gesture attempt. The person is trying to sign "${expectedGesture}".`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 403) {
          throw new Error('API key does not have access to vision models. Please check your OpenAI plan.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }
      }

      const data = await response.json();
      console.log('OpenAI API response:', data);
      const content = data.choices[0]?.message?.content;
      console.log('Raw content:', content);

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Clean the content - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      console.log('Cleaned content:', cleanContent);

      // Try to parse JSON response
      try {
        const result = JSON.parse(cleanContent);
        console.log('Successfully parsed OpenAI result:', result);
        return {
          recognized: result.recognized || false,
          gesture: result.gesture || 'unknown',
          confidence: result.confidence || 0,
          feedback: result.feedback || 'No feedback available',
          suggestions: result.suggestions || []
        };
      } catch (parseError) {
        console.error('JSON parse failed:', parseError);
        console.log('Failed content:', cleanContent);
        // Fallback if response isn't JSON
        return {
          recognized: false,
          gesture: 'unknown',
          confidence: 50,
          feedback: content,
          suggestions: ['Try positioning your hand more clearly in view of the camera']
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze gesture';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [config]);

  const testApiKey = useCallback(async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    config,
    isAnalyzing,
    error,
    setApiKey,
    analyzeGesture,
    testApiKey
  };
};