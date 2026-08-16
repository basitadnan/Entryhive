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

  // Platform detection flags
  const isNative = Capacitor.isNativePlatform();
  const isElectron = typeof window !== 'undefined' && !!(
    window.electronAPI || 
    (window.process && window.process.versions && window.process.versions.electron) || 
    navigator.userAgent.toLowerCase().includes('electron') ||
    window.location.protocol === 'file:'
  );
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );

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
        const authPromise = url.includes('code=') 
          ? supabase.auth.exchangeCodeForSession(getParam('code'))
          : supabase.auth.setSession({
              access_token: getParam('access_token'),
              refresh_token: getParam('refresh_token') || ''
            });

        // 5-second timeout for auth operations
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth operation timed out')), 5000)
        );

        const { data, error } = await Promise.race([authPromise, timeoutPromise]);
        if (error) throw error;
        session = data.session;

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
          
          // CRITICAL: If we detected a token in the URL but somehow didn't authenticate,
          // we MUST clear the hash anyway, otherwise App.jsx will stay stuck in the loading screen.
          if (typeof window !== 'undefined' && 
              (window.location.hash.includes('access_token=') || 
               window.location.hash.includes('code=') || 
               window.location.href.includes('access_token='))) {
            console.log('[Auth] Clearing stuck token from URL');
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }
      }
      return false;
    };

    // SAFETY: Force loading to end after 12 seconds no matter what
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Safety timer fired — forcing loading to end after 12s');
        setIsLoadingAuth(false);
      }
    }, 12000);

    async function bootSequence() {
      try {
        setIsLoadingAuth(true);
        let handled = false;
        
        if (isNative) {
          const res = await CapApp.getLaunchUrl();
          if (res?.url) handled = await handleUrl(res.url);
        }

        // Check current URL hash (Critical for Windows/Web cold starts)
        if (!handled && typeof window !== 'undefined' && window.location.hash) {
          handled = await handleUrl(window.location.href);
        }

        // Check Electron cached deep link
        if (!handled && window.electronAPI && window.electronAPI.getDeepLink) {
          try {
            const url = await window.electronAPI.getDeepLink();
            if (url) handled = await handleUrl(url);
          } catch (e) {
            console.warn('[Auth] Failed to get Electron deep link', e);
          }
        }

        // Fail-safe: In Electron, poll the hash/URL for tokens every 2 seconds
        if (isElectron && !handled) {
          const pollInterval = setInterval(async () => {
            if (isAuthenticated) {
              clearInterval(pollInterval);
              return;
            }
            if (window.location.hash.includes('access_token=') || window.location.hash.includes('code=')) {
              console.log('[Auth] Poller detected token in hash');
              await handleUrl(window.location.href);
            }
          }, 2000);
        }

        if (!handled) {
          // Race against a 10-second timeout so the app never stays stuck
          const mePromise = base44.auth.me();
          const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => {
              console.warn('[Auth] me() timed out after 10s');
              resolve(null);
            }, 10000)
          );
          const fullUser = await Promise.race([mePromise, timeoutPromise]);
          if (fullUser && isMounted) {
            setUser(fullUser);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.error('[Auth Boot Error]', e);
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted) setIsLoadingAuth(false);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`[Auth] State Change: ${event}`, session?.user?.email);
        if (!isMounted) return;

        if (session?.user) {
          // Fetch the full profile including is_premium status
          const fullUser = await base44.auth.me();
          if (fullUser && isMounted) {
            setUser(fullUser);
            setIsAuthenticated(true);
            
            // If we just signed in on the web and there's a token in the URL, clean it up
            if (event === 'SIGNED_IN' && typeof window !== 'undefined' && 
                (window.location.hash.includes('access_token=') || window.location.href.includes('access_token='))) {
              console.log('[Auth] Cleaning up URL after successful SIGNED_IN');
              window.history.replaceState(null, '', window.location.origin + '/');
              window.location.hash = '/';
            }
          }
        } else if (!isLoadingAuth && !processingLinkRef.current) {
          setIsAuthenticated(false);
          setUser(null);
        }
      });

      let urlListener;
      if (isNative) {
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
    return () => { isMounted = false; clearTimeout(safetyTimer); };
  }, []); // EMPTY dependency array - CRITICAL to stop the crash loop

  const logout = async (shouldRedirect = true) => {
    // Clear React state immediately so UI responds right away
    setIsAuthenticated(false);
    setUser(null);
    
    try {
      // Race the signOut against a 3-second timeout
      const signOutPromise = base44.auth.signOut(shouldRedirect ? '/' : undefined);
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => {
          console.warn('[Auth] signOut timed out after 3s, forcing redirect');
          resolve('timeout');
        }, 3000)
      );
      const result = await Promise.race([signOutPromise, timeoutPromise]);
      
      // If signOut timed out, force redirect manually
      if (result === 'timeout' && shouldRedirect) {
        window.location.hash = '/';
        window.location.reload();
      }
    } catch (e) {
      console.error('[Auth] Logout error:', e);
      // Force redirect even on error
      if (shouldRedirect) {
        window.location.hash = '/';
        window.location.reload();
      }
    }
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
    // For web users: redirect back to the site root. Supabase's detectSessionInUrl
    // will auto-detect the tokens in the URL fragment and establish the session.
    // For native/electron: use the Vercel bridge to relay tokens back to the app.
    let targetRedirect;

    if (isNative) {
      // Native (Capacitor/Android): redirect straight back into the app via the
      // custom scheme registered in AndroidManifest.xml. Supabase appends
      // #access_token=... and the appUrlOpen listener in this file calls setSession().
      targetRedirect = 'entryhive://callback';
    } else if (isElectron) {
      // Electron has no custom scheme handler — relay tokens via the Vercel bridge page.
      targetRedirect = 'https://entryhive-pak.vercel.app/login-callback?source=app';
    } else if (isDev) {
      // In dev mode, redirect to localhost origin
      targetRedirect = window.location.origin;
    } else {
      // Production web: redirect to site origin. Supabase will append #access_token=...
      // and detectSessionInUrl will pick it up automatically.
      targetRedirect = window.location.origin;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetRedirect,
        queryParams: { prompt: 'select_account' }
      }
    });

    if (error) {
      console.error('[Auth] Google OAuth error:', error.message);
      return;
    }

    if (data?.url) {
      if (isElectron && window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal(data.url);
      } else if (isNative) {
        await Browser.open({ url: data.url, windowName: '_blank' });
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
