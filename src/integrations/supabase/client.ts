import { createClient } from '@supabase/supabase-js';

// Gestures are stored in the app_auslan schema of the school's Supabase project (Drone1).
// Each browser has its own id; it is sent with every request and the database only lets a
// browser see and change its own gestures.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getUserId = (): string => {
  let userId = localStorage.getItem('auslan_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('auslan_user_id', userId);
  }
  return userId;
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: 'app_auslan' },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('x-auslan-user', getUserId());
      return fetch(input, { ...init, headers });
    },
  },
});
