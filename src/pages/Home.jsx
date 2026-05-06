import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { BookOpen, FileText, Lightbulb, BarChart3, ChevronRight, Timer, Target, TrendingUp, Trophy, Layers, Star, CheckSquare, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStaggerReveal, useScrollReveal } from '@/hooks/useScrollAnimation';
import { sounds } from '@/lib/sounds';

export default function Home() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const { containerProps: statsContainer, itemVariants: statsItem } = useStaggerReveal({ stagger: 0.05 });
  const { containerProps: featuresContainer, itemVariants: featuresItem } = useStaggerReveal({ stagger: 0.06 });
  const { motionProps: headerReveal } = useScrollReveal();
  const { motionProps: patternReveal } = useScrollReveal();

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
  const avgScore = totalTests > 0 ?
  Math.round([...practiceSessions, ...mockTests].reduce((s, t) => s + (t.score_percentage || 0), 0) / totalTests) :
  0;
  const bestScore = totalTests > 0 ?
  Math.round(Math.max(...[...practiceSessions, ...mockTests].map((t) => t.score_percentage || 0))) :
  0;

  const groupLabel = {
    'NAT-IE': '⚡ Pre-Engineering (NAT-IE)',
    'NAT-IM': '🩺 Pre-Medical (NAT-IM)',
    'NAT-ICS': '💻 Computer Science (NAT-ICS)'
  }[user?.nat_group] || 'Select Group';

  const stats = [
  { label: 'Streak', value: `${user?.streak || 1}d`, icon: Timer },
  { label: 'Tests', value: totalTests, icon: Target },
  { label: 'Average', value: `${avgScore}%`, icon: TrendingUp },
  { label: 'Best', value: `${bestScore}%`, icon: Trophy }];

  const sections = [
    {
      title: "Test Prep",
      items: [
        { label: 'Practice Mode', desc: 'Topic-wise MCQs with instant feedback', stat: `${practiceSessions.length} sessions completed`, icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10', path: '/practice' },
        { label: 'Mistake Reviewer', desc: 'Review and retake your wrong answers', stat: 'Learn from your errors', icon: CheckSquare, color: 'text-red-500', bgColor: 'bg-red-500/10', path: '/mistakes' },
        { label: 'Mock Test', desc: 'Full 90 Q, 120-min timed exam', stat: `${mockTests.length} mock tests taken`, icon: FileText, color: 'text-amber-500', bgColor: 'bg-amber-500/10', path: '/mock-test' },
        { label: 'Past Papers', desc: 'NAT-I practice sets · 2025–2026', stat: user?.is_premium ? '6 sets available · Start practising' : '🔒 Premium feature', icon: FileText, color: 'text-rose-500', bgColor: 'bg-rose-500/10', path: '/past-papers' },
      ]
    },
    {
      title: "AI & Smart Tools",
      items: [
        { label: 'Study Plan', desc: 'Personalised schedule for your weak areas', stat: user?.study_plan_content ? '✓ Plan ready · Tap to update' : '🔒 Premium · Set test date & get a plan', icon: Target, color: 'text-green-500', bgColor: 'bg-green-500/10', path: '/study-plan' },
        { label: 'Daily Tasks', desc: 'AI tasks based on your study plan', stat: user?.study_plan_content ? '🔒 Premium · Get today\'s tasks' : '🔒 Premium · Needs study plan', icon: CheckSquare, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', path: '/daily-tasks' },
        { label: 'Important Topics', desc: 'High-frequency topics from past papers', stat: '🆓 Free · No premium needed', icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-500/10', path: '/important-topics' },
        { label: 'Flashcards', desc: 'Rapid revision — premium only', stat: user?.is_premium ? 'Premium · Tap to revise' : '🔒 Premium feature', icon: Layers, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10', path: '/flashcards' },
        { label: 'Study Smart', desc: 'Tricks, shortcuts & concept guides', stat: '8 subjects · 60+ tricks', icon: Lightbulb, color: 'text-purple-500', bgColor: 'bg-purple-500/10', path: '/learn' },
      ]
    },
    {
      title: "Progress & Community",
      items: [
        { label: 'Performance', desc: 'Analytics and progress tracking', stat: totalTests > 0 ? `${totalTests} tests analyzed` : 'No tests yet', icon: BarChart3, color: 'text-rose-500', bgColor: 'bg-rose-500/10', path: '/performance' },
        { label: 'Leaderboard', desc: 'Top mock test scores · Compete with students', stat: `${mockTests.length > 0 ? `Your best: ${bestScore}%` : 'Complete a mock test to rank!'}`, icon: Trophy, color: 'text-amber-500', bgColor: 'bg-amber-500/10', path: '/leaderboard' },
        { label: 'Feedback', desc: 'Share bugs, ideas or suggestions', stat: 'We read every message', icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-500/10', path: '/feedback' }
      ]
    }
  ];

  const natPattern = [
    { label: 'English', count: 20, color: 'text-blue-400' }, 
    { label: 'Analytical', count: 20, color: 'text-pink-400' }, 
    { label: 'Quantitative', count: 20, color: 'text-green-400' }, 
    { label: 'Subject', count: 30, color: 'text-amber-400' }
  ];

  return (
    <div className="p-4 space-y-6 pb-10 overflow-x-hidden">
      
      {/* Greeting */}
      <motion.div className="flex items-center justify-between" {...headerReveal}>
        <div>
          <h1 className="text-2xl font-bold">Assalam-o-Alaikum 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">{groupLabel}</p>
        </div>
        {user?.is_premium && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full text-black ${user?.is_on_trial ? 'bg-indigo-400' : 'bg-gradient-to-r from-primary to-accent'}`}>
            {user?.is_on_trial ? 'Trial' : 'Premium'}
          </span>
        )}
      </motion.div>

      {/* Trial activated banner */}
      {user?.is_on_trial &&
        <Card className="p-3 bg-indigo-500/10 border-indigo-500/30">
          <p className="text-sm font-medium">🎁 <strong className="text-indigo-400">Free Trial Active!</strong> You have {user.trial_days_left} {user.trial_days_left === 1 ? 'day' : 'days'} of premium access left.</p>
        </Card>
      }

      {/* Test Date Countdown */}
      {user?.is_premium && user?.test_date && (() => {
        const today = new Date();today.setHours(0, 0, 0, 0);
        const target = new Date(user.test_date);target.setHours(0, 0, 0, 0);
        const diff = Math.round((target - today) / 86400000);
        if (diff === 1) return (
          <Card className="p-3 bg-amber-500/10 border-amber-500/30 cursor-pointer" onClick={() => navigate('/flashcards')}>
            <p className="text-sm">🔔 <strong>Test tomorrow!</strong> Good luck! Tap to revise your flashcards tonight.</p>
          </Card>);

        if (diff === 0) return (
          <Card className="p-3 bg-green-500/10 border-green-500/30">
            <p className="text-sm">🎯 <strong>Test day!</strong> You've prepared well — believe in yourself!</p>
          </Card>);

        if (diff > 0 && diff <= 7) return (
          <Card className="p-3 bg-blue-500/10 border-blue-500/30">
            <p className="text-sm">📅 <strong>{diff} days</strong> until your NAT test. Keep the momentum!</p>
          </Card>);

        return null;
      })()}

      {/* Premium activated banner */}
      {user?.is_premium && !user?.is_on_trial && !user?.test_date &&
      <Card className="p-3 bg-primary/10 border-primary/30">
          <p className="text-sm">🎉 <strong className="text-primary">Premium Activated!</strong> You now have unlimited access to all features.</p>
        </Card>
      }

      {/* Stats Row */}
      <motion.div className="grid grid-cols-4 gap-2" {...statsContainer}>
        {stats.map((s) =>
          <motion.div 
            key={s.label} 
            variants={statsItem}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Card className="p-3 text-center glass-card border-border/50 hover:border-primary/30 transition-colors">
              <s.icon className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Categorized Features */}
      <motion.div className="space-y-8" {...featuresContainer}>
        {sections.map(section => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary/80 px-1 border-b border-border/50 pb-2">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((f) => (
                <motion.div
                  key={f.label}
                  variants={featuresItem}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}>
                  <Card
                    className="p-4 cursor-pointer glass-card hover:bg-white/5 transition-all duration-300 border-border/30 hover:border-primary/40 group"
                    onClick={() => {sounds.click();navigate(f.path);}}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${f.bgColor} border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                        <f.icon className={`w-5 h-5 ${f.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{f.label}</h3>
                        <p className="text-sm text-muted-foreground">{f.desc}</p>
                        <p className={`text-[10px] uppercase tracking-wider mt-1.5 font-medium ${f.color}`}>{f.stat}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* NAT-I Test Pattern */}
      <motion.div {...patternReveal}>
        <Card className="p-4 glass-card border-border/50">
          <h3 className="font-semibold mb-3">NAT-I Test Pattern</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            {natPattern.map((s) =>
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-border/30 text-sm text-muted-foreground">
            <span>Total: <strong className="text-foreground">90 MCQs</strong></span>
            <span>Time: <strong className="text-foreground">120 Minutes</strong></span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}