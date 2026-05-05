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
    const timer = setTimeout(() => setIsLoadingAuth(false), 3000);

    if (isPlaceholder) {
      const saved = localStorage.getItem('nat_mock_user');
      if (saved) {
        setUser(JSON.parse(saved));
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
      clearTimeout(timer);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const mergedUser = await base44.auth.me();
        setUser(mergedUser);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
      clearTimeout(timer);
    }).catch(() => {
      setIsLoadingAuth(false);
      clearTimeout(timer);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mergedUser = await base44.auth.me();
        setUser(mergedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
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
