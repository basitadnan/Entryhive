import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import FeedbackPopup from '@/components/FeedbackPopup';

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Increment session count if not already done in this session
    if (!sessionStorage.getItem('session_started')) {
      sessionStorage.setItem('session_started', 'true');
      const count = parseInt(localStorage.getItem('login_count') || '0', 10);
      localStorage.setItem('login_count', count + 1);
    }

    // SAFETY: Force loading to end after 8 seconds no matter what
    const safetyTimer = setTimeout(() => {
      console.warn('[AppLayout] Safety timer fired — forcing load to finish after 8s');
      setLoading(false);
    }, 8000);

    async function loadUser() {
      try {
        // Race against a 6-second timeout
        const mePromise = base44.auth.me();
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => {
            console.warn('[AppLayout] me() timed out after 6s');
            resolve(null);
          }, 6000)
        );
        const me = await Promise.race([mePromise, timeoutPromise]);

        if (!me) {
          setLoading(false);
          clearTimeout(safetyTimer);
          return;
        }
        setUser(me);
        
        // Check if user has selected a NAT group
        if (!me.nat_group && window.location.pathname !== '/select-group') {
          navigate('/select-group');
        }
        
        // Track streak (non-blocking — don't hold up loading)
        const today = new Date().toISOString().split('T')[0];
        if (me.last_active_date !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const newStreak = me.last_active_date === yesterday ? (me.streak || 0) + 1 : 1;
          // Fire and forget — don't block the UI
          base44.auth.updateMe({ last_active_date: today, streak: newStreak })
            .then(() => setUser(prev => ({ ...prev, last_active_date: today, streak: newStreak })))
            .catch(e => console.warn("Could not update streak", e));
        }
      } catch (e) {
        console.error('[AppLayout] Failed to load user:', e);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    }
    loadUser();

    return () => clearTimeout(safetyTimer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative flex overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Fixed Sidebar */}
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="md:ml-64 flex-1 flex flex-col min-h-screen w-full transition-all">
        <AppHeader user={user} onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 w-full pb-20">
          <Outlet context={{ user, setUser }} />
        </main>
        <FeedbackPopup user={user} />
      </div>
      
    </div>
  );
}

