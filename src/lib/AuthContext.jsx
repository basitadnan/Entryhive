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
  const initialSessionHandled = useRef(false);

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

    // Fail-safe: Force hide loading after 8 seconds no matter what
    const failSafe = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth fail-safe triggered — forcing loading off');
        setIsLoadingAuth(false);
      }
    }, 8000);

    // Helper to fetch and merge the user profile
    const fetchAndSetUser = async (supabaseUser) => {
      try {
        const mergedUser = await base44.auth.me();
        if (isMounted && mergedUser) {
          setUser(mergedUser);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Error fetching user profile:", e);
      }
    };

    // Use onAuthStateChange as the SINGLE source of truth.
    // Supabase fires INITIAL_SESSION first (which restores persisted session),
    // then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED for subsequent events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth]', event, session?.user?.email);

      if (event === 'INITIAL_SESSION') {
        initialSessionHandled.current = true;
        if (session?.user) {
          await fetchAndSetUser(session.user);
        }
        if (isMounted) {
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchAndSetUser(session.user);
        }
        if (isMounted) {
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      }
    });

    // Secondary fail-safe: if INITIAL_SESSION never fires (older supabase-js),
    // fall back to getSession after 2 seconds.
    const fallback = setTimeout(async () => {
      if (!initialSessionHandled.current && isMounted) {
        console.warn('[Auth] INITIAL_SESSION never fired, falling back to getSession');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchAndSetUser(session.user);
          }
        } catch (e) {
          console.error("Fallback getSession error:", e);
        }
        if (isMounted) {
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(failSafe);
      clearTimeout(fallback);
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout(shouldRedirect ? '/' : undefined);
  };

  const loginWithPassword = async (email, password) => {
    const { data, error } = await base44.auth.signInWithPassword(email, password);
    if (!error && data?.user) {
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error };
  };

  const signUp = async (email, password, fullName) => {
    return await base44.auth.signUp(email, password, { full_name: fullName });
  };

  const loginWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();

    const redirectTo = isNative
      ? 'natprep://login-callback'
      : window.location.origin;

    const { data, error } = await base44.auth.signInWithGoogle(redirectTo);
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
