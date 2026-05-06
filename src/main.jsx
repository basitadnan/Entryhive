import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { supabase } from './lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

// Disable the buggy Web Locks API on native platforms to prevent the "lock stole" error
if (typeof window !== 'undefined' && Capacitor.isNativePlatform() && navigator.locks) {
  delete navigator.locks;
  console.log('[System] Web Locks API disabled for stability');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
