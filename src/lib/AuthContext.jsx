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

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout: Never stay stuck on loading for more than 8 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoadingAuth) {
        console.warn('[Auth] Safety timeout reached, forcing loading to false');
        setIsLoadingAuth(false);
      }
    }, 8000);

    const handleDeepLink = async (url) => {
      if (!url || !isMounted) return;
      if (Capacitor.isNativePlatform()) console.log('[Auth] Deep Link:', url);

      const hasCode = url.includes('code=');
      const hasTokens = url.includes('access_token=');
      if (!hasCode && !hasTokens) return;

      try {
        setIsLoadingAuth(true);
        const getParam = (name) => {
          const regex = new RegExp(`[#?&]${name}=([^&]+)`);
          const match = url.match(regex);
          return match ? match[1] : null;
        };

        let session = null;
        if (hasCode) {
          const code = getParam('code');
          if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            session = data.session;
          }
        } else if (hasTokens) {
          const access_token = getParam('access_token');
          const refresh_token = getParam('refresh_token');
          if (access_token) {
            const { data, error } = await supabase.auth.setSession({ 
              access_token, 
              refresh_token: refresh_token || '' 
            });
            if (error) throw error;
            session = data.session;
          }
        }

        if (session?.user && isMounted) {
          // BRUTE FORCE SYNC: Set everything at once
          setUser(session.user);
          setIsAuthenticated(true);
          setIsLoadingAuth(false);
          console.log('[Auth] Brute force sync success');
          
          // Force navigate to dashboard
          window.location.hash = '/';
          
          // Background profile fetch
          base44.auth.me().then(p => isMounted && p && setUser(p));
        }
      } catch (err) {
        console.error('[Auth Deep Link Error]', err);
        if (Capacitor.isNativePlatform()) alert('Login error: ' + (err.message || 'Check connection'));
      } finally {
        if (isMounted) {
          // Delay turning off loader just a bit to ensure UI catchup
          setTimeout(() => { if (isMounted) setIsLoadingAuth(false); }, 1000);
        }
      }
    };

    async function init() {
      if (isPlaceholder) {
        const saved = localStorage.getItem('nat_mock_user');
        if (saved) {
          setUser(JSON.parse(saved));
          setIsAuthenticated(true);
        }
        setIsLoadingAuth(false);
        clearTimeout(safetyTimeout);
        return;
      }

      try {
        // 1. Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setIsAuthenticated(true);
          setUser(session.user);
          base44.auth.me().then(p => isMounted && p && setUser(p));
        }

        // 2. Check for launch URL (Deep link)
        if (Capacitor.isNativePlatform()) {
          const res = await CapApp.getLaunchUrl();
          if (res?.url) await handleDeepLink(res.url);
        }
      } catch (e) {
        console.error('[Auth Init Error]', e);
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
          // If we have a session, we can clear the safety timeout
          if (isAuthenticated) clearTimeout(safetyTimeout);
        }
      }

      // 3. Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          setIsAuthenticated(true);
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
             const p = await base44.auth.me();
             if (isMounted) setUser(p || session.user);
          } else {
             setUser(session.user);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoadingAuth(false);
      });

      // 4. Listen for deep links (Mobile)
      let urlListener;
      if (Capacitor.isNativePlatform()) {
        urlListener = CapApp.addListener('appUrlOpen', (event) => {
          handleDeepLink(event.url);
        });
      }

      // 5. Listen for deep links (Windows/Mac Desktop)
      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.onDeepLink((url) => {
          console.log('[Auth] Electron Deep Link Received:', url);
          handleDeepLink(url);
        });
      }

      return () => {
        subscription.unsubscribe();
        if (urlListener) urlListener.remove();
        clearTimeout(safetyTimeout);
      };
    }

    init();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

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
    const isElectron = typeof window !== 'undefined' && (window.process?.versions?.electron || navigator.userAgent.includes('Electron'));
    
    // For both Mobile and Desktop Apps, use the custom scheme
    const redirectTo = (isNative || isElectron) ? 'natprep://login-callback' : window.location.origin;

    console.log('[Auth] Starting Google login with redirectTo:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { 
          access_type: 'offline', 
          prompt: 'consent'
        }
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
