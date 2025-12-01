import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomGesture {
  id: string;
  user_id: string;
  gesture_name: string;
  image_data: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const getUserId = (): string => {
  let userId = localStorage.getItem('auslan_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('auslan_user_id', userId);
  }
  return userId;
};

export const useCustomGestures = () => {
  const [gestures, setGestures] = useState<CustomGesture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGestures = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      const { data, error: fetchError } = await supabase
        .from('custom_gestures')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setGestures(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch gestures';
      setError(errorMessage);
      console.error('Error fetching gestures:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveGesture = useCallback(async (
    gestureName: string,
    imageData: string,
    description?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      const { error: insertError } = await supabase
        .from('custom_gestures')
        .insert({
          user_id: userId,
          gesture_name: gestureName,
          image_data: imageData,
          description: description || ''
        });

      if (insertError) throw insertError;

      await fetchGestures();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save gesture';
      setError(errorMessage);
      console.error('Error saving gesture:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchGestures]);

  const deleteGesture = useCallback(async (gestureId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      const { error: deleteError } = await supabase
        .from('custom_gestures')
        .delete()
        .eq('id', gestureId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      await fetchGestures();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete gesture';
      setError(errorMessage);
      console.error('Error deleting gesture:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchGestures]);

  useEffect(() => {
    fetchGestures();
  }, [fetchGestures]);

  return {
    gestures,
    isLoading,
    error,
    saveGesture,
    deleteGesture,
    refreshGestures: fetchGestures
  };
};
