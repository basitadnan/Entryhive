import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Browser } from '@capacitor/browser';
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
      console.log('[Auth] Handling URL:', url);
      
      const hasToken = url.includes('access_token=') || url.includes('code=');
      if (!hasToken) return false;

      const getParam = (name) => {
        // Robust regex to handle both fragment and query params, with or without slashes
        const regex = new RegExp(`[#?&]${name}=([^&]+)`);
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      try {
        processingLinkRef.current = true;
        setIsLoadingAuth(true);
        
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
          // 1. Clear hash first to prevent routing noise
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }

          // 2. Set basic state immediately for responsiveness
          setUser(session.user);
          setIsAuthenticated(true);
          
          // 4. Force navigation to home to "unlock" the app immediately
          if (typeof window !== 'undefined') {
            window.location.hash = '/';
          }

          // 5. Safe browser close (Delayed to avoid native bridge congestion)
          if (Capacitor.isNativePlatform()) {
            setTimeout(async () => {
              try {
                await Browser.close();
              } catch (e) {
                console.warn('[Auth] Browser already closed or failed to close', e);
              }
            }, 2000);
          }
          
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

        // Check current URL hash (Critical for Windows/Web cold starts)
        if (!handled && typeof window !== 'undefined' && window.location.hash) {
          handled = await handleUrl(window.location.href);
        }

        // Check Electron cached deep link
        if (!handled && window.electronAPI && window.electronAPI.getDeepLink) {
          const url = await window.electronAPI.getDeepLink();
          if (url) handled = await handleUrl(url);
        }

        if (!handled) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            setUser(session.user);
            setIsAuthenticated(true);
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
          setUser(session.user);
          setIsAuthenticated(true);
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
    const isElectron = typeof window !== 'undefined' && !!(
      window.electronAPI || 
      (window.process && window.process.versions && window.process.versions.electron) || 
      navigator.userAgent.toLowerCase().includes('electron')
    );
    const isDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1'
    );
    
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
      if (isElectron && window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal(data.url);
      } else if (isNative) {
        // Use Capacitor Browser for mobile to allow auto-closing
        await Browser.open({ url: data.url, windowName: '_blank' });
      } else if (!isElectron && !isNative) {
        window.location.href = data.url;
      } else {
        console.warn('[Auth] Fallback triggered in app context - preventing internal navigation');
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
