import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { App as CapApp } from '@capacitor/app';
import { supabase } from '@/lib/supabaseClient';
import { Analytics } from "@vercel/analytics/react";

import Landing from './pages/Landing';
import AppLayout from './components/Layout/AppLayout';
import Home from './pages/Home';
import ImportantTopics from './pages/ImportantTopics';
import SelectGroup from './pages/SelectGroup';
import Practice from './pages/Practice';
import PracticeSession from './pages/PracticeSession';
import MockTest from './pages/MockTest';
import MockTestSession from './pages/MockTestSession';
import Learn from './pages/Learn';
import LearnDetail from './pages/LearnDetail';
import Performance from './pages/Performance';
import Premium from './pages/Premium';
import Admin from './pages/Admin';
import Flashcards from './pages/Flashcards';
import Profile from './pages/Profile';
import StudyPlan from './pages/StudyPlan';
import PastPapers from './pages/PastPapers';
import Leaderboard from './pages/Leaderboard';
import DailyTasks from './pages/DailyTasks';
import FeedbackPage from './pages/FeedbackPage';
import MistakeReviewer from './pages/MistakeReviewer';
import Formulas from './pages/Formulas';
import Referral from './pages/Referral';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading NAT Prep...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Unauthenticated users: show public routes only
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/select-group" element={<SelectGroup />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice-session" element={<PracticeSession />} />
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="/mock-test-session" element={<MockTestSession />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:section" element={<LearnDetail />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/important-topics" element={<ImportantTopics />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/past-papers" element={<PastPapers />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/daily-tasks" element={<DailyTasks />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/mistakes" element={<MistakeReviewer />} />
        <Route path="/formulas" element={<Formulas />} />
        <Route path="/landing-preview" element={<Landing preview={true} />} />
        <Route path="/referral" element={<Referral />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function AppContent() {
  const [isProcessingDeepLink, setIsProcessingDeepLink] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;
      
      const hasTokens = url.includes('access_token=') && url.includes('refresh_token=');
      if (!hasTokens) return;

      console.log('[DeepLink] Auth redirect detected');
      setIsProcessingDeepLink(true);
      
      try {
        const getParam = (name) => {
          const regex = new RegExp(`[#?&]${name}=([^&]+)`);
          const match = url.match(regex);
          return match ? match[1] : null;
        };

        const access_token = getParam('access_token');
        const refresh_token = getParam('refresh_token');
        
        if (access_token && refresh_token) {
          console.log('[DeepLink] Setting session...');
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          
          if (error) {
            console.error('[DeepLink] Supabase Error:', error.message);
            setIsProcessingDeepLink(false);
          } else {
            console.log('[DeepLink] Session set, waiting for AuthContext...');
            // We don't set isProcessingDeepLink(false) here. 
            // We let the useEffect below handle it when isAuthenticated becomes true.
            window.location.hash = '/';
            
            // Safety timeout in case AuthContext never updates
            setTimeout(() => setIsProcessingDeepLink(false), 5000);
          }
        } else {
          setIsProcessingDeepLink(false);
        }
      } catch (err) {
        console.error('[DeepLink] Fatal Error:', err);
        setIsProcessingDeepLink(false);
      }
    };

    // Cold Start
    CapApp.getLaunchUrl().then(res => {
      if (res?.url) handleDeepLink(res.url);
    });
    
    // Warm Start
    const listener = CapApp.addListener('appUrlOpen', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      listener.remove();
    };
  }, []);

  // Synchronize: if we were processing a deep link and we are now authenticated, we can stop loading
  useEffect(() => {
    if (isProcessingDeepLink && isAuthenticated) {
      console.log('[DeepLink] Authenticated! Hiding loader.');
      setIsProcessingDeepLink(false);
    }
  }, [isAuthenticated, isProcessingDeepLink]);

  return (
    <Router>
      {isProcessingDeepLink ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Finalizing Login...</p>
          </div>
        </div>
      ) : (
        <AuthenticatedApp />
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppContent />
        <Toaster />
        <SonnerToaster />
        <Analytics />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App

export default App