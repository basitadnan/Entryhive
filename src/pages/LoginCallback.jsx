import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function LoginCallback() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is authenticated, we should go to the dashboard immediately
    if (isAuthenticated && !isLoadingAuth) {
      console.log("[LoginCallback] User authenticated, navigating to dashboard.");
      navigate('/', { replace: true });
      return;
    }

    const isNative = typeof window !== 'undefined' && (window.Capacitor?.isNativePlatform?.() || window.location.protocol === 'file:');
    const isElectron = typeof window !== 'undefined' && (
      window.electronAPI || 
      (window.process && window.process.versions && window.process.versions.electron) ||
      navigator.userAgent.toLowerCase().includes('electron')
    );
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const isFromApp = urlParams.get('source') === 'app';

    if (hash) {
      if (isNative || isElectron) {
        console.log("LoginCallback: Inside app context, letting AuthContext handle token.");
      } else if (isFromApp) {
        // We are on the WEB (Vercel bridge), but this login was started by the app.
        // Redirect back to the native app.
        console.log("LoginCallback: Bridge detected, redirecting to app...");
        window.location.href = `natprep://login-callback${hash}`;
      } else {
        console.log("LoginCallback: Web context, staying on page. Waiting for AuthContext...");
      }
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

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
