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
  const initRef = useRef(false);

  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  useEffect(() => {
    if (isPlaceholder) {
      const saved = localStorage.getItem('nat_mock_user');
      if (saved) {
        setUser(JSON.parse(saved));
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
      return;
    }

    let isMounted = true;

    // Fail-safe: Force hide loading after 10 seconds
    const failSafe = setTimeout(() => {
      if (isMounted && isLoadingAuth) {
        console.warn('[Auth] Fail-safe triggered');
        setIsLoadingAuth(false);
      }
    }, 10000);

    const handleAuthChange = async (event, session) => {
      console.log(`[Auth Event] ${event}`, { 
        hasUser: !!session?.user, 
        email: session?.user?.email,
        currentPath: window.location.hash
      });

      if (session?.user) {
        console.log('[Auth] Valid session found, setting isAuthenticated=true');
        setIsAuthenticated(true);
        
        try {
          console.log('[Auth] Fetching full profile...');
          const mergedUser = await base44.auth.me();
          if (isMounted && mergedUser) {
            console.log('[Auth] Profile fetched successfully');
            setUser(mergedUser);
          }
        } catch (e) {
          console.error('[Auth] Profile fetch failed', e);
          if (isMounted) setUser(session.user);
        }
      } else {
        console.log('[Auth] No session found');
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      if (isMounted && (event === 'INITIAL_SESSION' || !initRef.current)) {
        console.log('[Auth] Initial check complete, hiding loading screen');
        initRef.current = true;
        setIsLoadingAuth(false);
        clearTimeout(failSafe);
      }
    };

    // Initialize
    supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      isMounted = false;
      clearTimeout(failSafe);
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout(shouldRedirect ? '/' : undefined);
  };

  const loginWithPassword = async (email, password) => {
    const { data, error } = await base44.auth.signInWithPassword(email, password);
    if (!error && data?.user) {
      // Note: onAuthStateChange will handle state updates
      return { success: true };
    }
    return { success: false, error };
  };

  const signUp = async (email, password, fullName) => {
    return await base44.auth.signUp(email, password, { full_name: fullName });
  };

  const loginWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative ? 'natprep://login-callback' : window.location.origin;

    const { data, error } = await base44.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' }
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
