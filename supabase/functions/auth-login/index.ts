import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { compare } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== AUTH-LOGIN FUNCTION STARTED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Reading request body...');
    const requestBody = await req.json();
    console.log('Request body received:', Object.keys(requestBody));
    
    const { username, password } = requestBody;

    if (!username || !password) {
      console.log('Missing credentials');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Username and password are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Checking environment variables...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Server configuration error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Querying database for user:', username);
    const { data: user, error: dbError } = await supabase
      .from('user_credentials')
      .select('id, username, password_hash, api_key')
      .eq('username', username)
      .maybeSingle();

    console.log('Database query result:', !!user, !!dbError);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Database error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user) {
      console.log('User not found');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Wrong username or password' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User found, checking password...');
    
    // Use bcrypt to verify the hashed password
    const isPasswordValid = await compare(password, user.password_hash);
    console.log('Password verification result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Password mismatch');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Wrong username or password' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Password valid, checking API key...');
    const actualApiKey = Deno.env.get(user.api_key);
    console.log('API key exists:', !!actualApiKey);
    
    if (!actualApiKey) {
      console.error('API key not found:', user.api_key);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API key configuration error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Login successful!');
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        apiKey: actualApiKey
      },
      message: 'Login successful'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});