import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core';

// Ghostbuster: Disable Web Locks API on Android to prevent "lock stole" crashes
if (typeof window !== 'undefined' && Capacitor.isNativePlatform() && navigator.locks) {
  delete navigator.locks;
}

// Traffic Controller: Clean up URL hash after Supabase reads OAuth tokens
// With detectSessionInUrl: true, Supabase reads the tokens automatically.
// We just log for debugging; the AuthContext handles cleanup after auth completes.
if (typeof window !== 'undefined' && window.location.hash) {
  const h = window.location.hash;
  if (h.includes('access_token=') || h.includes('code=')) {
    console.log('[Boot] OAuth tokens detected in URL hash — Supabase will auto-handle');
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
