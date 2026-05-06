import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoginCallback() {
  useEffect(() => {
    // This page only exists to hand off the login from the browser to the app
    const hash = window.location.hash;
    if (hash) {
      // 1. Try to open the mobile app
      window.location.href = `natprep://login-callback${hash}`;
      
      // 2. Fallback: if they are on the web, just go to the dashboard
      setTimeout(() => {
        window.location.href = `/#/${hash}`;
      }, 2000);
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
