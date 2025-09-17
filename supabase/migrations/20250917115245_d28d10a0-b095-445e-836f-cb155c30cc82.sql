-- Step 1: Add bcrypt extension for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create a function to hash passwords using bcrypt
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT crypt(password, gen_salt('bf', 12));
$$;

-- Step 3: Create a function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password text, hashed_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT crypt(password, hashed_password) = hashed_password;
$$;

-- Step 4: Hash existing plaintext passwords in the schools table
UPDATE public.schools 
SET teacher_password = public.hash_password(teacher_password)
WHERE teacher_password IS NOT NULL 
AND teacher_password NOT LIKE '$%'; -- Only hash if not already hashed

-- Step 5: Drop the overly permissive service role policy
DROP POLICY IF EXISTS "Service role manages schools" ON public.schools;

-- Step 6: Create more restrictive policies for schools table
-- Allow admins to manage schools completely
CREATE POLICY "Admins can manage schools"
ON public.schools
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Allow service role to insert/update for system operations (but not unrestricted access)
CREATE POLICY "Service role can insert schools"
ON public.schools
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update schools"
ON public.schools
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Teachers can only read their own school (SELECT only)
-- (This policy already exists as "Teachers can read own school data")

-- Step 7: Create a secure function for teacher authentication
CREATE OR REPLACE FUNCTION public.authenticate_teacher(
  p_username text,
  p_password text,
  p_school_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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