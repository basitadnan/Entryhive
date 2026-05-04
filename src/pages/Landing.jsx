import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronRight, BookOpen, Target, TrendingUp, Zap, Award, Users, Shield, Sparkles, Crown, Layers, Calendar, CheckSquare, MessageSquare, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WORDS = ['Score Higher', 'Crack NAT-I', 'Study Smarter', 'Ace Your Exam', 'Beat the Competition'];

const FEATURES = [
  { icon: BookOpen, label: 'Practice Mode', desc: 'Topic-wise MCQs with instant AI-powered feedback & detailed explanations.', color: 'from-yellow-400 to-amber-600' },
  { icon: Target, label: 'Mock Tests', desc: 'Full 90-Q timed simulation — exactly like the real NAT environment.', color: 'from-amber-500 to-orange-600' },
  { icon: TrendingUp, label: 'Performance Analytics', desc: 'Deep analytics tracking your weak areas, strengths, and overall progress.', color: 'from-orange-400 to-red-500' },
  { icon: Calendar, label: 'Smart Study Plans', desc: 'AI-generated, day-by-day study schedules tailored to your exact test date.', color: 'from-emerald-400 to-green-600' },
  { icon: CheckSquare, label: 'Daily Tasks', desc: 'Actionable daily tasks automatically assigned based on your study plan.', color: 'from-teal-400 to-emerald-600' },
  { icon: Layers, label: 'Flashcards', desc: 'Rapid revision cards for formulas, vocabulary, and last-minute prep.', color: 'from-cyan-400 to-blue-600' },
  { icon: Zap, label: 'Study Smart (Tricks)', desc: 'Exclusive shortcuts, formulas, and time-saving techniques for quantitative.', color: 'from-purple-400 to-indigo-600' },
  { icon: Shield, label: 'Mistake Review', desc: 'A dedicated bank of questions you previously got wrong to ensure mastery.', color: 'from-rose-400 to-red-600' },
  { icon: Sparkles, label: 'Important Topics', desc: 'High-frequency past paper topics curated by NTS experts.', color: 'from-yellow-300 to-amber-500' },
  { icon: Trophy, label: 'Leaderboard', desc: 'Compete with thousands of other Pakistani students in real-time.', color: 'from-amber-300 to-yellow-600' }
];

const STATS = [
  { value: 500, label: 'Practice MCQs', suffix: '+' },
  { value: 3, label: 'NAT Tracks Supported', suffix: '' },
  { value: 10, label: 'Smart Tools', suffix: '' },
  { value: 100, label: 'AI Powered', suffix: '%' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const dur = 2000;
    const step = target / (dur / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing({ preview = false }) {
  const [wordIndex, setWordIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setWordIndex(p => (p + 1) % WORDS.length), 2500);
    return () => clearInterval(id);
  }, []);

  const go = (path) => { if (!preview) navigate(path); };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative selection:bg-primary/30">
      
      {/* Background Constellation */}
      <div className="bg-animation">
        <div className="stars" />
        <div className="stars2" />
      </div>
      <div className="bg-orb-3" />

      {/* ── Navbar ── */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-border/20 bg-background/50 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-primary">
            <span className="text-primary font-bold">N</span>
          </div>
          <span className="font-bold text-lg tracking-wide text-foreground">NAT<span className="text-primary">Prep</span></span>
        </div>
        {!preview && (
          <Button onClick={() => go('/login')} variant="ghost" className="text-muted-foreground hover:text-primary">
            Sign In
          </Button>
        )}
      </motion.nav>

      {/* ── Hero Section ── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.8 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Base44's Ultimate Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-4 tracking-tight">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4 }}
                className="text-gradient block h-[1.2em]"
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="text-foreground">in Your NAT-I Exam</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            The only platform you need for <strong className="text-foreground">NAT-IE, NAT-IM & NAT-ICS</strong>. Stop guessing. Start studying smart with AI.
          </p>
        </motion.div>

        {!preview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <Button onClick={() => go('/signup')} className="w-full h-14 text-base font-bold rounded-xl glow-primary bg-primary text-black hover:bg-primary/90 transition-all">
              Start Practicing for Free <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* ── Floating Dashboard Mockup ── */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1, type: "spring" }}
        className="relative z-10 w-full max-w-4xl mx-auto px-6 mb-24 perspective-1000"
      >
        <div className="rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden transform rotateX-12 scale-105 hover:rotate-0 transition-transform duration-700 ease-out premium-glow">
          <div className="h-8 bg-black/60 border-b border-primary/10 flex items-center px-4 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-70 pointer-events-none">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/5" />
             ))}
             <div className="col-span-2 sm:col-span-4 h-40 rounded-xl bg-primary/5 border border-primary/10" />
          </div>
        </div>
      </motion.div>

      {/* ── Stats Section ── */}
      <motion.div 
        variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto px-6 mb-24"
      >
        {STATS.map((s) => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card rounded-2xl p-6 text-center border-white/5">
            <p className="text-3xl md:text-4xl font-black text-primary mb-2"><AnimatedCounter target={s.value} suffix={s.suffix} /></p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Comprehensive Features Grid ── */}
      <div className="relative z-10 px-6 pb-24 w-full max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">We've built an entire ecosystem of tools to ensure you don't just pass, but rank at the top.</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6 border-white/5 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-2xl z-0" />
              <div className={`relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 relative z-10 text-foreground group-hover:text-primary transition-colors">{f.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>



      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center mt-auto bg-black/40 backdrop-blur-lg">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-primary font-bold">N</span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">NAT<span className="text-primary">Prep</span> © 2026</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Built with ❤️ for Pakistani Students</p>
      </footer>
    </div>
  );
}