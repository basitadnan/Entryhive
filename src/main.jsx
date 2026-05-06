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
  if (h.includes('access_token=') || h.includes('error=')) {
    if (!h.startsWith('#/')) {
      // FORCE the hash into a format HashRouter understands (e.g. #/access_token...)
      const newHash = '#/' + h.substring(1);
      window.history.replaceState(null, '', newHash);
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
