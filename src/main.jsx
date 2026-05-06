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
  const hash = window.location.hash;
  if (hash.includes('access_token=') && !hash.startsWith('#/')) {
    // Reformat the hash so HashRouter doesn't see it as a broken page path
    window.location.hash = '/' + hash.substring(1);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
