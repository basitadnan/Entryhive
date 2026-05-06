import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/lib/dbClient';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);
  const [appPublicSettings] = useState({});

  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (isPlaceholder) {
        const saved = localStorage.getItem('nat_mock_user');
        if (saved) {
          setUser(JSON.parse(saved));
          setIsAuthenticated(true);
        }
        setIsLoadingAuth(false);
        return;
      }

      try {
        // 1. Get initial session immediately
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);
          // Background fetch profile
          base44.auth.me().then(merged => {
            if (isMounted && merged) setUser(merged);
          }).catch(e => console.error('[Auth Profile Error]', e));
        }
      } catch (e) {
        console.error('[Auth Init Error]', e);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }

      // 2. Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        console.log('[Auth Event]', event, !!session);

        if (session?.user) {
          setIsAuthenticated(true);
          if (event === 'SIGNED_IN') {
             const merged = await base44.auth.me();
             if (isMounted) setUser(merged || session.user);
          } else {
             setUser(session.user);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        
        // Ensure loading is off if it was somehow still on
        setIsLoadingAuth(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    const cleanup = init();

    return () => {
      isMounted = false;
      // We can't await cleanup here but the isMounted check handles it
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout(shouldRedirect ? '/' : undefined);
  };

  const loginWithPassword = async (email, password) => {
    const { data, error } = await base44.auth.signInWithPassword(email, password);
    if (!error && data?.user) return { success: true };
    return { success: false, error };
  };

  const signUp = async (email, password, fullName) => {
    return await base44.auth.signUp(email, password, { full_name: fullName });
  };

  const loginWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();
    // Use the native scheme for redirect
    const redirectTo = isNative ? 'natprep://login-callback' : window.location.origin;

    console.log('[Auth] Starting Google login with redirectTo:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { 
          access_type: 'offline', 
          prompt: 'consent'
        },
        skipBrowserRedirect: false
      }
    });
    return { data, error };
  };

  const navigateToLogin = () => { base44.auth.redirectToLogin(); };
  const checkAppState = async () => {};

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings,
      authError, appPublicSettings,
      logout, loginWithPassword, signUp, loginWithGoogle, navigateToLogin, checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
