import { useState, useCallback } from 'react';
import { useOpenAI } from './useOpenAI';
import { CustomGesture } from './useCustomGestures';

export interface RecognitionResult {
  recognizedGesture: string;
  confidence: number;
  suggestions?: string[];
}

export const useGestureRecognition = () => {
  const { config, analyzeGesture } = useOpenAI();
  const [isRecognizing, setIsRecognizing] = useState(false);

  const recognizeCustomGesture = useCallback(async (
    imageData: string,
    trainedGestures: CustomGesture[]
  ): Promise<RecognitionResult> => {
    if (!config.isValid) {
      throw new Error('API key required for gesture recognition');
    }

    if (trainedGestures.length === 0) {
      throw new Error('No trained gestures available. Please train some gestures first.');
    }

    setIsRecognizing(true);

    try {
      const gestureNames = trainedGestures.map(g => g.gesture_name).join(', ');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are analyzing a hand gesture image. The user has trained the following custom gestures: ${gestureNames}.

Your task is to:
1. Identify which trained gesture this most closely matches
2. If uncertain, make your best guess from the trained gestures list
3. Provide a confidence score (0-100)

Respond with a JSON object:
{
  "recognizedGesture": "gesture_name",
  "confidence": number,
  "suggestions": ["helpful tip if confidence is low"]
}

Be helpful and encouraging. If the gesture is unclear, suggest improvements but still make your best match.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Which of my trained gestures (${gestureNames}) does this match?`
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
        throw new Error(`Recognition failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI');
      }

      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      const result = JSON.parse(cleanContent);

      return {
        recognizedGesture: result.recognizedGesture || 'unknown',
        confidence: result.confidence || 0,
        suggestions: result.suggestions || []
      };
    } catch (err) {
      console.error('Recognition error:', err);
      throw err;
    } finally {
      setIsRecognizing(false);
    }
  }, [config]);

  const buildSentence = useCallback(async (
    words: string[]
  ): Promise<string> => {
    if (!config.isValid) {
      throw new Error('API key required');
    }

    if (words.length === 0) {
      return '';
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are helping construct sentences from sign language gestures. The user has signed these words in sequence: ${words.join(', ')}.

Your task is to create a natural, grammatically correct sentence from these words. Fill in any missing articles, prepositions, or connecting words as needed to make the sentence flow naturally.

Respond with ONLY the complete sentence, nothing else. Keep it concise and natural.`
            },
            {
              role: 'user',
              content: `Create a natural sentence from these words: ${words.join(', ')}`
            }
          ],
          max_tokens: 100,
          temperature: 0.5
        })
      });

      if (!response.ok) {
        throw new Error('Failed to build sentence');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || words.join(' ');
    } catch (err) {
      console.error('Sentence building error:', err);
      return words.join(' ');
    }
  }, [config]);

  return {
    recognizeCustomGesture,
    buildSentence,
    isRecognizing
  };
};
