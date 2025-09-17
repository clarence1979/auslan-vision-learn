-- Insert new user with hashed password for clarence.goh@pvcc.vic.edu.au
-- Password: password12345 (hashed using bcrypt)
-- API Key: API2
INSERT INTO public.user_credentials (username, password_hash, api_key) VALUES
('clarence.goh@pvcc.vic.edu.au', '$2a$10$N9qo8uLOickgx2ZMRd09mOhknz.OQLnx8vJN3u.6VzFe8VjH7d7wi', 'API2');