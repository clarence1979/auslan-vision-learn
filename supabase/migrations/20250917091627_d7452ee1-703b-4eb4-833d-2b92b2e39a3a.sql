-- Update user API key to reference the OpenAI_Key2 secret
UPDATE public.user_credentials 
SET api_key = 'OpenAI_Key2'
WHERE username = 'clarence.goh@pvcc.vic.edu.au';