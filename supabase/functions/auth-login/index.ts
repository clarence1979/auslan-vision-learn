import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Username and password are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query user credentials
    const { data: user, error: dbError } = await supabase
      .from('user_credentials')
      .select('id, username, password_hash, api_key')
      .eq('username', username)
      .maybeSingle();

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
      console.log('User not found:', username);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Wrong username or password' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Wrong username or password' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the actual API key from Supabase secrets
    const actualApiKey = Deno.env.get(user.api_key);
    
    if (!actualApiKey) {
      console.error('API key not found in secrets:', user.api_key);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API key configuration error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return success with user data
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
    console.error('Error in auth-login function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});