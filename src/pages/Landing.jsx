import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { ChevronRight, BookOpen, Target, TrendingUp, Zap, Award, Users, Shield, Sparkles, Crown, Layers, Calendar, CheckSquare, MessageSquare, Trophy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sounds } from '@/lib/sounds';
import { useAuth } from '@/lib/AuthContext';

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
  { value: 10, label: 'Success Tracks', suffix: '' },
  { value: 60, label: 'Shortcuts & Tricks', suffix: '+' },
  { value: 100, label: 'Syllabus Coverage', suffix: '%' },
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

  const isElectron = /electron/i.test(navigator.userAgent) || window.location.protocol === 'file:';

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If we're logged in, get away from here!
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

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
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-9 h-9 rounded-lg overflow-hidden border border-primary/40 flex items-center justify-center glow-primary"
          >
            <img src="./logo.png" alt="NAT Prep Logo" className="w-full h-full object-cover" />
          </motion.div>
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
            <Shield className="w-3 h-3" /> Official NAT Preparation Platform
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
          <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            Struggling with your NAT-I preparation? We built this platform <strong className="text-foreground">just for you</strong> to master every subject, practice with confidence and ace ur exams.
          </p>
        </motion.div>

        {!preview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <Button 
              onClick={() => {
                sounds.vibrate(200);
                go('/signup');
              }} 
              className="w-full h-14 text-base font-bold rounded-xl glow-primary bg-primary text-black hover:bg-primary/90 transition-all"
            >
              Start Practicing for Free <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            {!Capacitor.isNativePlatform() && !isElectron && (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={() => { window.open('https://github.com/AbdulBasitAdnan/Nat-Prep/releases/latest/download/NAT-Prep.apk', '_blank'); }}
                  variant="outline"
                  className="flex-1 h-14 text-base font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10 transition-all gap-2"
                >
                  Android App <Zap className="w-4 h-4 fill-primary" />
                </Button>
                <Button 
                  onClick={() => { window.open('https://github.com/AbdulBasitAdnan/Nat-Prep/releases/latest/download/NAT%20Prep-Setup-0.0.0.exe', '_blank'); }}
                  variant="outline"
                  className="flex-1 h-14 text-base font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10 transition-all gap-2"
                >
                  Windows App <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Floating Dashboard Mockup ── */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1, type: "spring" }}
        className="relative z-10 w-full max-w-4xl mx-auto px-6 mb-24 perspective-1000"
      >
        <div className="rounded-2xl border border-primary/20 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden transform rotateX-12 scale-105 hover:rotate-0 transition-transform duration-700 ease-out premium-glow">
          <div className="h-10 bg-white/5 border-b border-primary/10 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-amber-500/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/30" />
            </div>
            <div className="mx-auto text-[10px] text-muted-foreground font-medium tracking-widest uppercase opacity-50">Student Performance Dashboard</div>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Success Probability */}
            <div className="md:col-span-4 space-y-6">
              <div className="glass-card rounded-2xl p-6 border-primary/20 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                <div className="relative w-24 h-24 rounded-full border-4 border-primary/10 flex items-center justify-center mb-3">
                  <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin-slow" />
                  <span className="text-2xl font-black text-primary">84%</span>
                </div>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Success Probability</p>
                <p className="text-[9px] text-muted-foreground mt-1 text-center">Based on 1,200+ practice questions</p>
              </div>

              <div className="glass-card rounded-2xl p-4 border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">12 Day</p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Active Study Streak</p>
                </div>
              </div>
            </div>

            {/* Right Column: Subject Mastery */}
            <div className="md:col-span-8 glass-card rounded-2xl p-6 border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold tracking-tight">Subject Mastery Level</h4>
                <div className="px-2 py-1 rounded bg-primary/10 text-[9px] font-bold text-primary uppercase">Track: NAT-IE</div>
              </div>
              
              <div className="space-y-5">
                {[
                  { label: 'Quantitative Reasoning', val: '92%', color: 'bg-primary' },
                  { label: 'Analytical Reasoning', val: '91%', color: 'bg-amber-500' },
                  { label: 'English Comprehension', val: '85%', color: 'bg-emerald-500' },
                  { label: 'Physics & Chemistry', val: '93%', color: 'bg-blue-500' },
                ].map((s, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-medium uppercase tracking-wide">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="text-foreground">{s.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: s.val }} transition={{ duration: 1.5, delay: 1 + (idx * 0.1) }}
                        className={`h-full ${s.color} shadow-[0_0_10px_rgba(212,175,55,0.3)]`} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted" />)}
                  <div className="w-6 h-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[8px] font-bold">+50</div>
                </div>
                <p className="text-[9px] text-muted-foreground italic tracking-wide">Join to ace ur exams now</p>
              </div>
            </div>
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
      </div>      {/* ── Download App Section (Hidden on Electron) ── */}
      {!isElectron && (
        <section className="relative z-10 px-6 pb-24 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 border-primary/20 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-6 glow-primary">
              <Zap className="w-8 h-8 text-primary fill-primary/20" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Study on the Go</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Get the best preparation experience with our Android App. Practice offline, get instant notifications, and study anywhere, anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => { window.open('https://github.com/AbdulBasitAdnan/Nat-Prep/releases/latest/download/NAT-Prep.apk', '_blank'); }}
                className="h-14 px-8 text-lg font-bold rounded-xl glow-primary bg-primary text-black hover:bg-primary/90 transition-all gap-2"
              >
                Download APK <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => { window.open('https://github.com/AbdulBasitAdnan/Nat-Prep/releases/latest/download/NAT%20Prep-Setup-0.0.0.exe', '_blank'); }}
                variant="outline"
                className="h-14 px-8 text-lg font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/10 transition-all gap-2"
              >
                Download for Windows <Download className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em] opacity-60">Latest Version 2026 · Safe & Verified</p>
          </div>
        </motion.div>
      </section>
      )}


      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center mt-auto bg-black/40 backdrop-blur-lg">
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <img src="./logo.png" alt="NAT Prep Logo" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">NAT<span className="text-primary">Prep</span> © 2026</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Built with ❤️ for Pakistani Students</p>
      </footer>
    </div>
  );
}