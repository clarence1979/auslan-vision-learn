-- Create user_credentials table for authentication
CREATE TABLE public.user_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credentials (admin-only access for now)
CREATE POLICY "Admin only: View user credentials" 
ON public.user_credentials 
FOR SELECT 
USING (false); -- Initially restrictive - will be updated when admin system is ready

CREATE POLICY "Admin only: Insert user credentials" 
ON public.user_credentials 
FOR INSERT 
WITH CHECK (false); -- Initially restrictive

CREATE POLICY "Admin only: Update user credentials" 
ON public.user_credentials 
FOR UPDATE 
USING (false)
WITH CHECK (false);

CREATE POLICY "Admin only: Delete user credentials" 
ON public.user_credentials 
FOR DELETE 
USING (false);

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some test data (with bcrypt-style hash for 'password123')
INSERT INTO public.user_credentials (username, password_hash, api_key) VALUES
('demo_user', '$2a$10$rOz6w8z9QM9vHHgF5H5osuP5Kr8jEHvhY8jz.DJzNvE7QZ8VfGZby', 'sk-test-key-replace-with-real-key'),
('teacher1', '$2a$10$rOz6w8z9QM9vHHgF5H5osuP5Kr8jEHvhY8jz.DJzNvE7QZ8VfGZby', 'sk-test-key-replace-with-real-key');

-- Add an updated_at column for better record keeping
ALTER TABLE public.user_credentials ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();