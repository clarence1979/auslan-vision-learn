/*
  # Enable Row Level Security on custom_gestures

  This migration enables Row Level Security (RLS) on the custom_gestures table.
  Without RLS enabled, the policies are not enforced, leaving the table completely open.

  ## Security Fix
  - Enables RLS on the custom_gestures table to enforce the existing policies:
    - Users can view all custom gestures (SELECT)
    - Users can create gestures with valid user_id (INSERT)
    - Users can update only their own gestures (UPDATE)
    - Users can delete only their own gestures (DELETE)

  ## Important Note
  Once RLS is enabled, all access to the table will be governed by the policies.
  This is a critical security requirement for protecting user data.
*/

-- Enable Row Level Security on custom_gestures table
ALTER TABLE custom_gestures ENABLE ROW LEVEL SECURITY;
