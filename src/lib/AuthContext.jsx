import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/lib/dbClient';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);
  const [appPublicSettings] = useState({});

  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

  // Use a Ref for processing state to avoid triggering the boot useEffect loop
  const processingLinkRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    const handleUrl = async (url) => {
      if (!url || !isMounted) return false;
      const hasToken = url.includes('access_token=') || url.includes('code=');
      if (!hasToken) return false;

      try {
        processingLinkRef.current = true;
        setIsLoadingAuth(true);
        
        const getParam = (name) => {
          const regex = new RegExp(`[#?&]${name}=([^&]+)`);
          const match = url.match(regex);
          return match ? match[1] : null;
        };

        let session = null;
        if (url.includes('code=')) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(getParam('code'));
          if (error) throw error;
          session = data.session;
        } else {
          const { data, error } = await supabase.auth.setSession({
            access_token: getParam('access_token'),
            refresh_token: getParam('refresh_token') || ''
          });
          if (error) throw error;
          session = data.session;
        }

        if (session?.user && isMounted) {
          setUser(session.user);
          setIsAuthenticated(true);
          window.location.hash = '/';
          return true;
        }
      } catch (e) {
        console.error('[Auth Deep Link Error]', e);
      } finally {
        if (isMounted) {
          processingLinkRef.current = false;
          setIsLoadingAuth(false);
        }
      }
      return false;
    };

    async function bootSequence() {
      try {
        setIsLoadingAuth(true);
        let handled = false;
        
        if (Capacitor.isNativePlatform()) {
          const res = await CapApp.getLaunchUrl();
          if (res?.url) handled = await handleUrl(res.url);
        }

        if (!handled) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            setIsAuthenticated(true);
            setUser(session.user);
          }
        }
      } catch (e) {
        console.error('[Auth Boot Error]', e);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted || processingLinkRef.current) return; 
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      });

      let urlListener;
      if (Capacitor.isNativePlatform()) {
        urlListener = CapApp.addListener('appUrlOpen', (event) => {
          handleUrl(event.url);
        });
      }

      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.onDeepLink((url) => {
          handleUrl(url);
        });
      }

      return () => {
        subscription.unsubscribe();
        if (urlListener) urlListener.remove();
      };
    }

    bootSequence();
    return () => { isMounted = false; };
  }, []); // EMPTY dependency array - CRITICAL to stop the crash loop

  const logout = async (shouldRedirect = true) => {
    setIsAuthenticated(false);
    setUser(null);
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
    const isElectron = typeof window !== 'undefined' && (window.electronAPI || window.process?.versions?.electron || navigator.userAgent.includes('Electron'));
    const isDev = window.location.hostname === 'localhost';
    
    let targetRedirect = 'https://natprep.vercel.app/login-callback';
    if (isNative || isElectron) {
      targetRedirect = 'natprep://login-callback';
    } else if (isDev) {
      targetRedirect = window.location.origin + '/login-callback';
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirect,
        queryParams: { prompt: 'select_account' }
      }
    });

    if (error) {
      console.error(error.message);
      return;
    }

    if (data?.url) {
      if (isElectron && window.electronAPI?.openExternal) {
        // For Windows Desktop, open in REAL browser to avoid white screen/security blocks
        window.electronAPI.openExternal(data.url);
      } else {
        window.location.href = data.url;
      }
    }
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
