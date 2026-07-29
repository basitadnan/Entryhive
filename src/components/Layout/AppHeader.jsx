import React, { useState } from 'react';
import { Menu, Search, Flame, Bell, Sun, Moon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/lib/ThemeContext';

export default function AppHeader({ user, onMenuClick }) {
  const queryClient = useQueryClient();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Fetch Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', user?.email)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    const { supabase } = await import('@/lib/supabaseClient');
    await supabase.from('notifications').update({ is_read: true }).eq('user_email', user?.email).eq('is_read', false);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Left Side: Mobile Menu & Search */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden text-muted-foreground active:scale-95 transition-transform">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-80 shadow-sm transition focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tests, topics..." 
              className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right Side: Streak, Theme Toggle, Bell, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
            <Flame className="w-4 h-4 text-[hsl(var(--accent))]" />
            <span className="text-sm font-bold text-[hsl(var(--accent))]">{user?.streak || 0}-day streak</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 active:scale-90 transition-all shadow-sm"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <Sun className="w-4 h-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotifsOpen(!notifsOpen);
                if (!notifsOpen && unreadCount > 0) markAllAsRead();
              }}
              className="relative text-muted-foreground hover:text-foreground active:scale-95 transition-transform p-1"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[hsl(var(--accent))] rounded-full border border-background"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notifsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 max-h-[400px] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl z-50 hide-scrollbar"
                >
                  <div className="p-4 border-b border-border flex justify-between items-center bg-secondary sticky top-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</span>
                    {unreadCount > 0 && <span className="text-[10px] text-primary font-bold">{unreadCount} New</span>}
                  </div>
                  <div className="divide-y divide-border">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 hover:bg-secondary transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}>
                          <p className="text-sm font-bold text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                            {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[var(--primary-dark)] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {getInitials(user?.full_name || user?.email)}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
