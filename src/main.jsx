import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core';

// Ghostbuster: Disable Web Locks API on Android to prevent "lock stole" crashes
if (typeof window !== 'undefined' && Capacitor.isNativePlatform() && navigator.locks) {
  delete navigator.locks;
}

// Traffic Controller: Fix HashRouter conflicts with Google OAuth tokens
if (typeof window !== 'undefined' && window.location.hash) {
  const h = window.location.hash;
  // If hash contains token but is NOT a valid HashRouter path (doesn't start with #/)
  if ((h.includes('access_token=') || h.includes('code=')) && !h.startsWith('#/')) {
    // Check if we have a path before the token-hash
    // Supabase redirects often look like #access_token=... but HashRouter needs #/access_token=...
    // OR it might be #/login-callback#access_token=... which is already fine.
    const newHash = '#/' + h.substring(1);
    window.history.replaceState(null, '', newHash);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
