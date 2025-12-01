/*
  # Create Custom Gestures Table

  1. New Tables
    - `custom_gestures`
      - `id` (uuid, primary key) - Unique identifier for each custom gesture
      - `user_id` (text) - Local identifier for the user (stored client-side, not auth-based)
      - `gesture_name` (text) - Name/label for the gesture (e.g., "hello", "water", "help")
      - `image_data` (text) - Base64 encoded image of the gesture
      - `description` (text, optional) - User's description of the gesture
      - `created_at` (timestamptz) - When the gesture was created
      - `updated_at` (timestamptz) - When the gesture was last updated
  
  2. Security
    - Enable RLS on `custom_gestures` table
    - Add policies for users to manage their own gestures based on user_id
    - Since this is a learning app without authentication, we use a client-generated user_id
  
  3. Notes
    - This table stores user-trained gestures for personalized learning
    - Users can create, read, update, and delete their own gestures
    - The user_id is client-generated and stored in localStorage for local identification
*/

CREATE TABLE IF NOT EXISTS custom_gestures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  gesture_name text NOT NULL,
  image_data text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_gestures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gestures"
  ON custom_gestures
  FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own gestures"
  ON custom_gestures
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own gestures"
  ON custom_gestures
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true))
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own gestures"
  ON custom_gestures
  FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

CREATE INDEX IF NOT EXISTS idx_custom_gestures_user_id ON custom_gestures(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_gestures_created_at ON custom_gestures(created_at DESC);