import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoginCallback() {
  useEffect(() => {
    const isNative = typeof window !== 'undefined' && (window.Capacitor?.isNativePlatform?.() || window.location.protocol === 'file:');
    const isElectron = typeof window !== 'undefined' && (window.electronAPI || window.process?.versions?.electron);
    const hash = window.location.hash;

    if (hash) {
      if (isNative || isElectron) {
        // If we are ALREADY in the app, the AuthContext will handle the hash.
        console.log("LoginCallback: Already in app, letting AuthContext handle it.");
      } else {
        // We are on the WEB (Vercel), try to open the native app
        window.location.href = `natprep://login-callback${hash}`;
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <h1 className="text-2xl font-bold">Authenticating...</h1>
        <p className="text-muted-foreground">We're redirecting you back to the NAT Prep app.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="text-sm text-primary underline"
        >
          Not redirecting? Click here to go to dashboard
        </button>
      </motion.div>
    </div>
  );
}
