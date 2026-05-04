import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import AppHeader from './AppHeader';
import ChatBot from '@/components/chat/ChatBot';

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const me = await base44.auth.me();
      if (!me) {
        setLoading(false);
        return;
      }
      setUser(me);
      
      // Check if user has selected a NAT group
      if (!me.nat_group && window.location.pathname !== '/select-group') {
        navigate('/select-group');
      }
      
      // Track streak
      const today = new Date().toISOString().split('T')[0];
      if (me.last_active_date !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = me.last_active_date === yesterday ? (me.streak || 0) + 1 : 1;
        // Optional update
        try {
          await base44.auth.updateMe({ last_active_date: today, streak: newStreak });
          setUser(prev => ({ ...prev, last_active_date: today, streak: newStreak }));
        } catch (e) {
          console.warn("Could not update streak", e);
        }
      }
      
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="bg-animation">
        <div className="stars" />
        <div className="stars2" />
      </div>
      <div className="bg-orb-3" />
      <AppHeader user={user} />
      <main className="max-w-lg mx-auto pb-20">
        <Outlet context={{ user, setUser }} />
      </main>
      <ChatBot user={user} />
    </div>
  );
}