# Supabase Credentials Guide

To connect your application to Supabase, you'll need specific credentials that identify your Supabase project. Here's how to obtain and use them:

## Getting Your Supabase Credentials

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com)
   - Sign up for an account if you don't have one

2. **Create a New Project**:
   - Click "New Project" in the Supabase dashboard
   - Enter a name for your project
   - Set a secure database password (save this somewhere safe)
   - Choose a region closest to your users
   - Click "Create new project"

3. **Find Your Credentials**:
   - Once your project is created, go to the project dashboard
   - Click on the "Settings" icon (gear icon) in the left sidebar
   - Select "API" from the settings menu
   - You'll find two important credentials:
     - **URL**: Your project URL (e.g., `https://abcdefghijklm.supabase.co`)
     - **anon/public** key: A long string that starts with "eyJ..."

## Where to Use These Credentials

In the `js/supabase-config.js` file (which you'll need to create), add your credentials:

```javascript
// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon/public key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
```

Then include this file in your HTML before any other JavaScript files that use Supabase:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/supabase-config.js"></script>
<!-- Other scripts that use Supabase -->
```

## Security Considerations

1. **The anon/public key is safe to include in client-side code**:
   - This key has limited permissions set by Row Level Security (RLS) policies
   - It cannot access data without proper authorization

2. **Never include your service_role key in client-side code**:
   - This key has full admin access to your database
   - Keep it secure for server-side operations only

3. **Set up Row Level Security (RLS) policies**:
   - In the Supabase dashboard, go to "Authentication" > "Policies"
   - Create policies that restrict what authenticated and anonymous users can do
   - Example policy: "Users can only read and update their own data"

## Testing Your Connection

After setting up your credentials, you can test the connection with this code:

```javascript
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

// Call the function
testSupabaseConnection();
```

## Next Steps After Setting Up Credentials

1. Create your database tables as described in the integration guide
2. Set up authentication methods (email/password, social logins, etc.)
3. Implement Row Level Security policies
4. Replace localStorage code with Supabase API calls

With these credentials properly configured, your application will be able to securely connect to Supabase and store data in the cloud instead of the browser's localStorage.