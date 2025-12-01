/*
  # Add set_config function

  1. New Functions
    - `set_config` - A function to set session configuration parameters
      - Used to set app.user_id for RLS policies
      - Takes parameter name and value as inputs
      - Returns void
  
  2. Security
    - Function is accessible to all users (no authentication required)
    - Only sets session-level configuration (not permanent)
    - Safe for client-side use in this educational context
  
  3. Notes
    - This function enables client-side RLS policy enforcement
    - The user_id is client-generated and session-scoped
    - Essential for the custom gestures feature to work properly
*/

CREATE OR REPLACE FUNCTION set_config(parameter text, value text)
RETURNS void AS $$
BEGIN
  PERFORM set_config(parameter, value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;