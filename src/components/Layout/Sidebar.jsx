import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, X, LayoutDashboard, Target, FileText, Archive, 
  CalendarCheck, Layers, AlertCircle, Star, Trophy, Settings, 
  Lightbulb, Calculator, CheckSquare, MessageSquare, Shield, Crown, Zap, LogOut, CreditCard, Building, Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Sidebar({ user, open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isPremium = user?.is_premium === true;
  const isAdmin = user?.role === 'admin';
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return; // Prevent double-clicks
    setSigningOut(true);
    
    // Fallback: if logout takes more than 3 seconds, force redirect anyway
    const fallbackTimer = setTimeout(() => {
      console.warn('[Sidebar] Logout timed out, forcing redirect');
      window.location.hash = '/login';
      window.location.reload();
    }, 3000);

    try {
      await logout(true);
    } catch (e) {
      console.error('[Sidebar] Logout failed:', e);
      // Force clear and redirect on error
      window.location.hash = '/login';
      window.location.reload();
    } finally {
      clearTimeout(fallbackTimer);
      setSigningOut(false);
    }
  };

  const MAIN_MENU = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'FAST University', icon: Building, path: '/fast', proOnly: true },
    { label: 'Air University', icon: GraduationCap, path: '/air-university', proOnly: true },
    { label: 'Practice Session', icon: Target, path: '/practice' },
    { label: 'Mock Tests', icon: FileText, path: '/mock-test' },
    { label: 'Past Papers', icon: Archive, path: '/past-papers' },
  ];

  const LEARNING_TOOLS = [
    { label: 'Study Plan', icon: CalendarCheck, path: '/study-plan' },
    { label: 'Daily Tasks', icon: CheckSquare, path: '/daily-tasks' },
    { label: 'Flashcards', icon: Layers, path: '/flashcards' },
    { label: 'Mistake Reviewer', icon: AlertCircle, path: '/mistakes' },
    { label: 'Important Topics', icon: Star, path: '/important-topics' },
    { label: 'Study Tricks', icon: Lightbulb, path: '/learn' },
    { label: 'Formulas', icon: Calculator, path: '/formulas' },
    { label: 'Merit Calculator', icon: Calculator, path: '/merit-calculator' },
  ];

  const COMMUNITY = [
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Feedback', icon: MessageSquare, path: '/feedback' },
    { label: 'Refer a Friend', icon: Crown, path: '/referral' },
    { label: 'Billing', icon: CreditCard, path: '/billing' },
    { label: 'Profile', icon: Settings, path: '/profile' },
  ];

  const renderLinks = (links) => (
    links.map(link => {
      const isActive = location.pathname === link.path;
      return (
        <Link 
          key={link.path} 
          to={link.path}
          onClick={onClose}
          className={`sidebar-link flex items-center justify-between ${isActive ? 'active' : ''}`}
        >
          <div className="flex items-center gap-3">
            <link.icon className="w-5 h-5 shrink-0" />
            <span>{link.label}</span>
          </div>
          {link.proOnly && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 rounded">Pro Only</span>
          )}
        </Link>
      );
    })
  );

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 w-64 z-40 flex flex-col transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
        <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">EntryHive</span>
        </Link>
        <button onClick={onClose} className="md:hidden text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
        <div className="px-3 mt-2 mb-2 text-xs font-bold text-white/40 uppercase tracking-wider">Main Menu</div>
        {renderLinks(MAIN_MENU)}

        <div className="px-3 mt-6 mb-2 text-xs font-bold text-white/40 uppercase tracking-wider">Learning Tools</div>
        {renderLinks(LEARNING_TOOLS)}

        <div className="px-3 mt-6 mb-2 text-xs font-bold text-white/40 uppercase tracking-wider">Community</div>
        {renderLinks(COMMUNITY)}

        <div className="px-3 mt-6 mb-2 text-xs font-bold text-white/40 uppercase tracking-wider">Contact Support</div>
        <a 
          href="https://wa.me/923337613822"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link flex items-center gap-3"
        >
          <MessageSquare className="w-5 h-5 shrink-0 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-sm">WhatsApp</span>
            <span className="text-[11px] text-white/50 font-medium tracking-wider mt-0.5">03337613822</span>
          </div>
        </a>

        {isAdmin && (
          <>
            <div className="px-3 mt-6 mb-2 text-xs font-bold text-white/40 uppercase tracking-wider">Admin</div>
            {renderLinks([{ label: 'Admin Panel', icon: Shield, path: '/admin' }])}
          </>
        )}
        
        <div className="mt-8 pt-4 border-t border-white/10">
          <button 
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition disabled:opacity-50"
          >
            {signingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            <span className="font-medium">{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </nav>

      {/* Upgrade Card */}
      {!isPremium && (
        <div className="p-4 shrink-0">
          <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-bold text-white">Unlock Premium</p>
            <p className="text-xs text-white/60 mb-3">Unlimited mocks & past papers</p>
            <button 
              onClick={() => { onClose(); navigate('/premium'); }}
              className="bg-primary text-primary-foreground text-xs w-full py-2 rounded-lg font-semibold hover:bg-[var(--primary-dark)] transition"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
