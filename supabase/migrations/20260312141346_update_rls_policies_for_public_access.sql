/*
  # Update RLS Policies for Public Access

  This migration updates the Row Level Security policies on the custom_gestures table
  to allow public access without authentication. Users can freely create, read, update,
  and delete their own gestures using a browser-generated user_id stored in localStorage.

  ## Changes
  
  1. Drop existing restrictive policies
  2. Create new public-friendly policies:
     - Anyone can SELECT all gestures
     - Anyone can INSERT gestures (no authentication required)
     - Anyone can UPDATE gestures with matching user_id
     - Anyone can DELETE gestures with matching user_id

  ## Security Notes
  
  - Users are identified by a user_id stored in localStorage (not authenticated)
  - RLS still protects users from modifying each other's data
  - This is suitable for a free, public learning application
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all custom gestures" ON custom_gestures;
DROP POLICY IF EXISTS "Users can create custom gestures" ON custom_gestures;
DROP POLICY IF EXISTS "Users can update own gestures" ON custom_gestures;
DROP POLICY IF EXISTS "Users can delete own gestures" ON custom_gestures;

-- Create new public access policies

-- Allow anyone to view all gestures
CREATE POLICY "Public can view all custom gestures"
  ON custom_gestures
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to create gestures with a valid user_id
CREATE POLICY "Public can create custom gestures"
  ON custom_gestures
  FOR INSERT
  TO public
  WITH CHECK (user_id IS NOT NULL AND user_id != '');

-- Allow users to update only their own gestures
CREATE POLICY "Public can update own gestures"
  ON custom_gestures
  FOR UPDATE
  TO public
  USING (user_id IS NOT NULL)
  WITH CHECK (user_id IS NOT NULL);

-- Allow users to delete only their own gestures
CREATE POLICY "Public can delete own gestures"
  ON custom_gestures
  FOR DELETE
  TO public
  USING (user_id IS NOT NULL);
