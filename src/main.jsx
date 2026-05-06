import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { supabase } from '@/lib/supabaseClient'

// ── Intercept OAuth tokens from URL hash BEFORE HashRouter mounts ──
// When Supabase OAuth (Google) redirects back, tokens are placed in the URL hash:
//   https://yourapp.com/#access_token=xxx&refresh_token=yyy&...
// But HashRouter ALSO uses the hash for routing, causing a conflict.
// We grab the tokens here, set the session, and clean up the hash.
async function handleOAuthRedirect() {
  const hash = window.location.hash;
  
  // Check if the hash contains OAuth tokens (not a normal route like #/home)
  if (hash && hash.includes('access_token=') && hash.includes('refresh_token=')) {
    const params = new URLSearchParams(hash.replace('#', ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    
    if (access_token && refresh_token) {
      console.log('[OAuth Intercept] Found tokens in URL hash, setting session...');
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      
      if (error) {
        console.error('[OAuth Intercept] setSession error:', error);
      } else {
        console.log('[OAuth Intercept] Session set successfully');
      }
      
      // Clean the hash so HashRouter doesn't try to route to "access_token=..."
      window.location.hash = '/';
    }
  }
}

// Run the intercept, then mount React
handleOAuthRedirect().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  )
});
