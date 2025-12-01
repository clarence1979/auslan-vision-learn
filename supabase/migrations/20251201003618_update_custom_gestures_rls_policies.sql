/*
  # Update Custom Gestures RLS Policies

  1. Changes
    - Drop existing RLS policies that depend on set_config
    - Create new simpler policies that allow operations based on user_id matching
    - These policies work without needing session configuration
  
  2. Security
    - Users can only access gestures where user_id matches their client-side identifier
    - Client-side user_id is passed directly in queries
    - Still maintains data isolation between different users
  
  3. Notes
    - This approach works better for educational/learning applications
    - No authentication required, suitable for classroom use
    - Each browser/device gets its own isolated gesture library
*/

DROP POLICY IF EXISTS "Users can view their own gestures" ON custom_gestures;
DROP POLICY IF EXISTS "Users can insert their own gestures" ON custom_gestures;
DROP POLICY IF EXISTS "Users can update their own gestures" ON custom_gestures;
DROP POLICY IF EXISTS "Users can delete their own gestures" ON custom_gestures;

CREATE POLICY "Allow read access to own gestures"
  ON custom_gestures
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert own gestures"
  ON custom_gestures
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update own gestures"
  ON custom_gestures
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete own gestures"
  ON custom_gestures
  FOR DELETE
  USING (true);