/*
  # Drop Insecure set_config Function

  This migration removes the set_config function that has a mutable search_path,
  which is a security vulnerability.

  ## Security Fix
  - Drops the `set_config(text, text)` function with the correct signature
*/

-- Drop the insecure function with correct signature
DROP FUNCTION IF EXISTS set_config(text, text);
