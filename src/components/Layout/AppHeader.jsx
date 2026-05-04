import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, BookOpen, FileText, Lightbulb, BarChart3, Crown, Shield, LogOut, Layers, User, Star, Trophy, CheckSquare, MessageSquare, Target, Brain, Calculator, Gift } from 'lucide-react';
import { base44 } from '@/lib/dbClient';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Practice Mode', icon: BookOpen, path: '/practice' },
  { label: 'Mock Test', icon: FileText, path: '/mock-test' },
  { label: 'Flashcards', icon: Layers, path: '/flashcards' },
  { label: 'Study Smart', icon: Lightbulb, path: '/learn' },
  { label: 'Past Papers', icon: FileText, path: '/past-papers' },
  { label: 'Important Topics', icon: Star, path: '/important-topics' },
  { label: 'Formula Sheet', icon: Calculator, path: '/formulas' },
  { label: 'Study Plan', icon: Brain, path: '/study-plan' },
  { label: 'Daily Tasks', icon: CheckSquare, path: '/daily-tasks' },
  { label: 'Performance', icon: BarChart3, path: '/performance' },
  { label: 'Mistake Review', icon: Target, path: '/mistakes' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
  { label: 'My Profile', icon: User, path: '/profile' },
  { label: 'Refer Friends', icon: Gift, path: '/referral' },
  { label: 'Feedback', icon: MessageSquare, path: '/feedback' },
  { label: 'Premium', icon: Crown, path: '/premium' },
];

const NAV_SECTIONS = [
  { label: 'Study', items: ['/', '/practice', '/mock-test', '/flashcards', '/learn', '/past-papers', '/important-topics', '/formulas'] },
  { label: 'Tools', items: ['/study-plan', '/daily-tasks', '/performance', '/mistakes', '/leaderboard'] },
  { label: 'Account', items: ['/profile', '/referral', '/feedback', '/premium'] },
];

// New palette colors
const C = {
  primary: '#d4af37', // Gold
  primaryDim: 'rgba(212,175,55,0.12)',
  primaryBorder: 'rgba(212,175,55,0.25)',
  headerBg: 'rgba(5,5,5,0.92)', // True black
  headerBorder: 'rgba(212,175,55,0.08)',
  sidebarBg: '#050505', // True black
  sidebarBorder: 'rgba(212,175,55,0.10)',
  textMuted: '#8a857a', // Neutral muted text
  textLight: '#ecebe0', // Soft off-white
  sectionLabel: '#54524a', // Darker neutral label
  activeColor: '#d4af37',
  activeBg: 'rgba(212,175,55,0.07)',
};

export default function AppHeader({ user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isPremium = user?.is_premium === true;
  const isAdmin = user?.role === 'admin';

  const allItems = isAdmin ? [...NAV_ITEMS, { label: 'Admin Panel', icon: Shield, path: '/admin' }] : NAV_ITEMS;

  const go = (path) => { sounds.click(); sounds.navigate(); navigate(path); setMenuOpen(false); };

  return (
    <>
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background: C.headerBg,
          backdropFilter: 'blur(12px)', /* Reduced from 24px for performance */
          borderBottom: `1px solid ${C.headerBorder}`,
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(p => !p); 
            }}
            className="w-12 h-12 flex items-center justify-center active:scale-95 transition-transform"
            style={{ color: C.textMuted }}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                border: `1px solid ${C.primaryBorder}`,
                background: `radial-gradient(circle at 40% 35%, ${C.primaryDim}, transparent 70%)`,
                boxShadow: `0 0 12px rgba(0,229,255,0.15)`,
              }}>
              <span style={{ color: C.primary, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', lineHeight: 1 }}>N</span>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', letterSpacing: '0.03em', color: C.textLight }}>
              NAT<span style={{ color: C.primary }}>Prep</span>
            </span>
          </Link>
        </div>

        <button
          onClick={() => go('/profile')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg active:scale-95 transition-transform"
          style={{
            border: isPremium ? '1px solid rgba(168,85,247,0.4)' : `1px solid rgba(255,255,255,0.06)`,
            background: isPremium ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)',
            color: isPremium ? '#a855f7' : C.textMuted,
          }}
        >
          {isPremium ? <Crown className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          {isPremium && <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#a855f7' }}>PRO</span>}
        </button>
      </header>

      {/* Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-72 flex flex-col overflow-hidden"
              style={{ background: C.sidebarBg, borderRight: `1px solid ${C.sidebarBorder}` }}
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              {/* User header */}
              <div className="p-5 pt-6" style={{ borderBottom: `1px solid ${C.sidebarBorder}` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium"
                    style={{
                      background: isPremium ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
                      border: isPremium ? '1px solid rgba(168,85,247,0.3)' : `1px solid rgba(255,255,255,0.06)`,
                      color: isPremium ? '#a855f7' : C.textMuted,
                    }}>
                    {isPremium ? <Crown className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: C.textLight }}>{user?.full_name || 'Student'}</p>
                    <p className="text-xs truncate" style={{ color: C.sectionLabel }}>{user?.email}</p>
                  </div>
                  {isPremium && (
                    <span className="text-[9px] font-bold px-2 py-0.5 tracking-widest rounded" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' }}>
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[10px] mt-2 tracking-widest uppercase" style={{ color: C.sectionLabel }}>
                  {user?.nat_group || 'No group selected'}
                </p>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {NAV_SECTIONS.map(section => {
                  const sectionItems = allItems.filter(item => section.items.includes(item.path));
                  return (
                    <div key={section.label}>
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] px-3 mb-2" style={{ color: C.sectionLabel }}>{section.label}</p>
                      {sectionItems.map((item, i) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <motion.button
                            key={item.path}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => go(item.path)}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm transition-all rounded-lg"
                            style={{
                              color: isActive ? C.activeColor : C.textMuted,
                              background: isActive ? C.activeBg : 'transparent',
                              borderLeft: isActive ? `2px solid ${C.activeColor}` : '2px solid transparent',
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            <item.icon className="w-3.5 h-3.5 shrink-0" />
                            {item.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
                {isAdmin && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] px-3 mb-2" style={{ color: C.sectionLabel }}>Admin</p>
                    <button onClick={() => go('/admin')} className="flex items-center gap-3 w-full px-3 py-2 text-sm transition-all rounded-lg" style={{ color: C.textMuted, borderLeft: '2px solid transparent' }}>
                      <Shield className="w-3.5 h-3.5" /> Admin Panel
                    </button>
                  </div>
                )}
              </div>

              {/* Logout */}
              <div className="p-3" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
                <button
                  onClick={() => base44.auth.logout('/')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-all rounded-lg"
                  style={{ color: C.textMuted }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}