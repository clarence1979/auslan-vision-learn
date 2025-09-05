import { useState, useEffect } from 'react';

export interface GestureProgress {
  gestureId: string;
  attempts: number;
  successes: number;
  lastPracticed: string;
  mastered: boolean;
}

export interface UserProgress {
  gestures: Record<string, GestureProgress>;
  totalAttempts: number;
  totalSuccesses: number;
  streak: number;
  lastActive: string;
}

const STORAGE_KEY = 'auslan-progress';

const defaultProgress: UserProgress = {
  gestures: {},
  totalAttempts: 0,
  totalSuccesses: 0,
  streak: 0,
  lastActive: new Date().toISOString()
};

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [progress]);

  const recordAttempt = (gestureId: string, success: boolean) => {
    setProgress(prev => {
      const gestureProgress = prev.gestures[gestureId] || {
        gestureId,
        attempts: 0,
        successes: 0,
        lastPracticed: new Date().toISOString(),
        mastered: false
      };

      const newGestureProgress = {
        ...gestureProgress,
        attempts: gestureProgress.attempts + 1,
        successes: success ? gestureProgress.successes + 1 : gestureProgress.successes,
        lastPracticed: new Date().toISOString(),
        mastered: success && gestureProgress.successes >= 4 // Master after 5 successes
      };

      return {
        ...prev,
        gestures: {
          ...prev.gestures,
          [gestureId]: newGestureProgress
        },
        totalAttempts: prev.totalAttempts + 1,
        totalSuccesses: success ? prev.totalSuccesses + 1 : prev.totalSuccesses,
        streak: success ? prev.streak + 1 : 0,
        lastActive: new Date().toISOString()
      };
    });
  };

  const getGestureProgress = (gestureId: string): GestureProgress | null => {
    return progress.gestures[gestureId] || null;
  };

  const getSuccessRate = (): number => {
    if (progress.totalAttempts === 0) return 0;
    return Math.round((progress.totalSuccesses / progress.totalAttempts) * 100);
  };

  const getMasteredCount = (): number => {
    return Object.values(progress.gestures).filter(g => g.mastered).length;
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
  };

  return {
    progress,
    recordAttempt,
    getGestureProgress,
    getSuccessRate,
    getMasteredCount,
    resetProgress
  };
};