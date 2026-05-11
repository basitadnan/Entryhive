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
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

import Landing from './pages/Landing';
import AppLayout from './components/Layout/AppLayout';
import Home from './pages/Home';
import ImportantTopics from './pages/ImportantTopics';
import SelectGroup from './pages/SelectGroup';
import Practice from './pages/Practice';
import Maintenance from './components/Maintenance';
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
import LoginCallback from './pages/LoginCallback';

const AuthenticatedApp = () => {
  const { authError, isAuthenticated } = useAuth();

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
        <Route path="/login-callback" element={<LoginCallback />} />
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
      <Route path="/login-callback" element={<LoginCallback />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function AppContent() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  
  // Maintenance Mode Toggle (controlled via .env)
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  return (
    <Router>
      {isLoadingAuth ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Setting everything up</h2>
            <p className="text-muted-foreground animate-pulse">Please wait while we prepare your dashboard...</p>
          </motion.div>
        </div>
      ) : (
        <AuthenticatedApp />
      )}
    </Router>
  );
}

// Main Application Component - Handles global state and routing (v1.0.1)
function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppContent />
        <Toaster />
        <SonnerToaster />
        {!Capacitor.isNativePlatform() && !window.electronAPI && <Analytics />}
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App