import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { supabase } from '@/lib/supabaseClient'

// ── Intercept OAuth tokens from URL hash ──
// Because we use HashRouter, we need to handle the case where Supabase
// puts tokens in the hash (e.g. #access_token=...) before the router mounts.
async function handleInitialAuth() {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    // If it's a Supabase redirect, we let the app mount and the AuthContext/App deep link listeners handle it,
    // OR we can set it here. To be safe with HashRouter, we set it here and clear the hash.
    const params = new URLSearchParams(hash.substring(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
      window.location.hash = '/'; // Redirect to root
    }
  }
}

handleInitialAuth().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
});
