// Supabase Configuration
// This file initializes the Supabase client with your project credentials

// Initialize Supabase client with your project URL and public anon key
const supabaseUrl = 'https://xcvyzivpeyxfovagzzli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjdnl6aXZwZXl4Zm92YWd6emxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzkyNTUsImV4cCI6MjA2MjYxNTI1NX0.AXTYEre6AIorPo6rszeiG9pVDq6KHQIA5f9BCkfka2U';

// Create the Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Test connection function - can be called to verify connection
async function testSupabaseConnection() {
  try {
    // Try to get the current user
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connected successfully!');
    return true;
  } catch (e) {
    console.error('Supabase connection test failed:', e);
    return false;
  }
}

// IMPORTANT SECURITY NOTE:
// The service role key and JWT secret should NEVER be included in client-side code.
// They should only be used in secure server environments.
// The public/anon key used above is safe for client-side code.