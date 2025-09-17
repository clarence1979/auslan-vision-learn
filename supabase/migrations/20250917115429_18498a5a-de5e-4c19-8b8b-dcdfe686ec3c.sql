-- Fix security warnings: Set proper search_path for all functions

-- Fix hash_password function
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT crypt(password, gen_salt('bf', 12));
$$;

-- Fix verify_password function  
CREATE OR REPLACE FUNCTION public.verify_password(password text, hashed_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT crypt(password, hashed_password) = hashed_password;
$$;

-- Fix authenticate_teacher function
CREATE OR REPLACE FUNCTION public.authenticate_teacher(
  p_username text,
  p_password text,
  p_school_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Get the hashed password for the teacher
  SELECT teacher_password INTO stored_hash
  FROM public.schools
  WHERE teacher_username = p_username 
  AND name = p_school_name;

  -- Return false if teacher not found
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  -- Verify the password
  RETURN public.verify_password(p_password, stored_hash);
END;
$$;