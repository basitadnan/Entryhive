import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { 
  Target, FileText, Archive, CalendarCheck, Layers, 
  Star, Lightbulb, Trophy, AlertTriangle, ArrowRight, Sparkles, Crown 
} from 'lucide-react';
import { sounds } from '@/lib/sounds';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const { data: practiceSessions = [] } = useQuery({
    queryKey: ['practice-sessions'],
    queryFn: () => base44.entities.PracticeSession.filter({ user_email: user?.email, completed: true }),
    enabled: isReady && !!user?.email
  });

  const { data: mockTests = [] } = useQuery({
    queryKey: ['mock-tests'],
    queryFn: () => base44.entities.MockTestResult.filter({ user_email: user?.email, completed: true }),
    enabled: isReady && !!user?.email
  });

  const totalTests = practiceSessions.length + mockTests.length;
  const bestScore = mockTests.length > 0 ?
    Math.round(Math.max(...mockTests.map((t) => t.score_percentage || 0))) : 0;

  // Calculate some fake course progress based on tests
  const courseProgress = Math.min(Math.round((totalTests / 50) * 100), 100) || 5;

  const quickActions = [
    { id: 'practice', title: 'Practice', desc: 'Topic-wise MCQs', icon: Target, iconColor: 'text-primary', iconBg: 'bg-primary/10 border-primary/20', path: '/practice' },
    { id: 'mock', title: 'Mock Tests', desc: 'Full 90 Qs exams', icon: FileText, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10 border-emerald-500/20', path: '/mock-test' },
    { id: 'past', title: 'Past Papers', desc: 'Real NAT papers', icon: Archive, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10 border-blue-500/20', path: '/past-papers' },
    { id: 'plan', title: 'Study Plan', desc: 'AI schedule', icon: CalendarCheck, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10 border-indigo-500/20', path: '/study-plan' },
    { id: 'flash', title: 'Flashcards', desc: 'Quick revision', icon: Layers, iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10 border-purple-500/20', path: '/flashcards' },
    { id: 'imp', title: 'Imp. Topics', desc: 'High-yield areas', icon: Star, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10 border-rose-500/20', path: '/important-topics' },
    { id: 'tricks', title: 'Study Tricks', desc: 'Shortcuts & tips', icon: Lightbulb, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10 border-amber-500/20', path: '/learn' },
    { id: 'leader', title: 'Leaderboard', desc: 'See your rank', icon: Trophy, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-500/10 border-yellow-500/20', path: '/leaderboard' },
  ];

  const go = (path) => { sounds.click(); navigate(path); };

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="p-6 space-y-8 pb-24 max-w-6xl mx-auto">
      
      {/* Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground">Hello, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Ready to crush your NAT goals today? Let's get to work.</p>
      </motion.div>

      {/* Top Row: Prep Banner & Today's Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Entry Hive Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-primary/20"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold mb-4 uppercase tracking-wider backdrop-blur-sm border border-white/10 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Your Active Prep
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
                {user?.nat_group ? `${user.nat_group} Comprehensive Batch` : 'Select your NAT Group'}
              </h2>
              <div className="text-white/90 mb-8 max-w-lg leading-relaxed font-medium space-y-2">
                <p>
                  You are on a <span className="font-bold underline decoration-white/50 underline-offset-4">{user?.streak || 0}-day streak</span>. Keep it up to maintain your high ranking and secure your university spot!
                </p>
                {user?.is_premium && (
                  <div className="mt-2">
                    <p className="inline-flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg text-sm font-bold border border-white/10 shadow-sm backdrop-blur-md">
                      <Crown className="w-4 h-4 text-amber-300" />
                      Premium Active • {user?.subscription_days_left || 0} Days Remaining
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20 max-w-md shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <span className="font-bold text-sm">Course Progress</span>
                <span className="font-display font-bold text-xl">{courseProgress}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
                <div className="bg-white rounded-full h-full transition-all duration-1000 ease-out" style={{ width: `${courseProgress}%` }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Progress */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm"
        >
          <h3 className="font-display text-xl font-bold text-foreground mb-6">Mock Test High Score</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--border))" strokeWidth="3"></circle>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeDasharray="97.3" strokeDashoffset={97.3 - (97.3 * (bestScore / 100))} strokeLinecap="round" className="transition-all duration-1000 ease-out"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-black text-foreground">{bestScore}%</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Best Score</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 w-full">
            <div className="bg-secondary border border-border rounded-xl p-3 shadow-sm">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Tests Taken</p>
              <p className="font-display text-xl font-bold text-foreground">{totalTests}</p>
            </div>
            <div className="bg-secondary border border-border rounded-xl p-3 shadow-sm">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Premium</p>
              <p className="font-display text-xl font-bold text-primary">{user?.is_premium ? 'Active' : 'No'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mistake Reviewer Alert */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-rose-500/20 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-colors"
        style={{ background: 'linear-gradient(to right, hsl(var(--card)), hsl(var(--secondary)/0.5))' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 border border-rose-500/20 shadow-sm">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Review Your Mistakes!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">You have previously answered questions incorrectly. Review them now to avoid repeating on exam day.</p>
          </div>
        </div>
        <button onClick={() => go('/mistakes')} className="w-full md:w-auto bg-rose-500 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 flex-shrink-0 shadow-lg shadow-rose-500/20 relative z-10 text-lg">
          Review Mistakes <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.button 
              key={action.id} 
              onClick={() => go(action.path)} 
              className="bg-card border border-border p-5 rounded-3xl flex flex-col items-start text-left w-full hover:border-primary/40 hover:shadow-md transition-all group"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.05) }}
            >
              <div className={`w-12 h-12 rounded-xl border ${action.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <h3 className="font-display font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-xs text-muted-foreground font-medium">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
