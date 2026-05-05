import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/lib/dbClient';

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
    
    // Fail-safe: Force hide loading after 6 seconds no matter what
    const failSafe = setTimeout(() => {
      if (isMounted) setIsLoadingAuth(false);
    }, 6000);

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const mergedUser = await base44.auth.me();
          if (isMounted && mergedUser) {
            setUser(mergedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.error("Auth Init Error:", e);
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mergedUser = await base44.auth.me();
        if (isMounted) {
          setUser(mergedUser);
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          clearTimeout(failSafe);
        }
      }
    });

    return () => { 
      isMounted = false;
      subscription.unsubscribe(); 
      clearTimeout(failSafe);
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
    const { data, error } = await base44.auth.signInWithGoogle();
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
