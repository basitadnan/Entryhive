import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Menu, X, ArrowRight, PlayCircle, CheckCircle, 
  TrendingUp, Flame, Target, Check, FileText, Clock, ChevronLeft, 
  ChevronRight, Timer, ListOrdered, Layers, Repeat, ShieldCheck,
  Star, Users, Smartphone, Archive, CalendarCheck, CheckSquare,
  AlertCircle, Lightbulb, MessageSquareText, BarChart3, Trophy, Plus,
  Facebook, Instagram, Youtube, Twitter
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const Counter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "0px" }}
      onViewportEnter={() => {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }}
    >
      {count.toLocaleString()}{suffix}
    </motion.div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    if (openFaq === index) setOpenFaq(null);
    else setOpenFaq(index);
  };

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-card/90 backdrop-blur-xl border-b border-border shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-black tracking-tight">EntryHive</span>
            </Link>

            <div className="hidden md:flex items-center gap-10 text-sm font-bold">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#syllabus" className="text-muted-foreground hover:text-foreground transition-colors">Syllabus</a>
              <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/signup" className="btn-primary px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Start Free</Link>
            </div>

            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-foreground">
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-card z-[60] p-8 shadow-2xl border-l border-border md:hidden transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end mb-10">
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-secondary rounded-xl"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex flex-col gap-6 text-xl font-display font-bold">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-primary">Features</a>
          <a href="#syllabus" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-primary">Syllabus</a>
          <a href="#dashboard" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-primary">Dashboard</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-primary">FAQ</a>
          <div className="h-px bg-border my-2"></div>
          <Link to="/login" className="text-muted-foreground hover:text-primary">Sign In</Link>
          <Link to="/signup" className="btn-primary py-4 rounded-xl text-center shadow-lg shadow-primary/20 mt-2">Start Free</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 shadow-sm">
                <span className="relative w-2.5 h-2.5 rounded-full bg-primary">
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
                </span>
                <span className="text-xs font-bold text-primary tracking-widest uppercase">Pakistan's Smartest Entry Hive</span>
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05] mb-8 text-foreground tracking-tight">
                Master <span className="text-primary relative inline-block">NAT<div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-2 rounded-sm"></div></span><br/>
                with structured<br/>
                <span className="text-primary">smart learning.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl font-medium">
                Stop wasting time on random prep. EntryHive gives you a clear study plan, real past papers, and AI-driven feedback to guarantee your university admission.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <Link to="/signup" className="w-full sm:w-auto btn-primary px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 text-lg hover:scale-105 transition-transform">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#features" className="w-full sm:w-auto bg-card border-2 border-border text-foreground px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:border-primary/40 transition-colors text-lg">
                  <PlayCircle className="w-6 h-6 text-primary" /> See How it Works
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-foreground font-bold">
                <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="w-3 h-3 text-emerald-500" /></div> 100% Free to start</span>
                <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="w-3 h-3 text-emerald-500" /></div> 1,200+ MCQs</span>
                <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><CheckCircle className="w-3 h-3 text-emerald-500" /></div> Real past papers</span>
              </div>
            </Reveal>

            {/* Mockup */}
            <Reveal delay={0.2} className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-[40px] blur-xl -z-10"></div>
              
              <div className="absolute -top-8 -right-8 z-20 bg-card rounded-2xl shadow-2xl p-4 border-2 border-border float-anim">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Score Improved</p>
                    <p className="font-display text-2xl font-black text-foreground">+24 pts</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 z-20 bg-card rounded-2xl shadow-2xl p-4 border-2 border-border float-anim" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Flame className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Study Streak</p>
                    <p className="font-display text-2xl font-black text-foreground">12 days</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-[32px] border-2 border-border shadow-2xl overflow-hidden">
                <div className="h-10 bg-secondary/80 border-b border-border flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-display font-black text-2xl text-foreground">Student Dashboard</h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1">Welcome back, Ayesha!</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                      <Target className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold text-primary">84% Goal</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-secondary rounded-2xl p-5 border border-border">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-foreground">Quantitative</p>
                        <span className="text-sm text-primary font-black">92%</span>
                      </div>
                      <div className="h-2 w-full bg-card rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-primary rounded-full w-[92%]"></div>
                      </div>
                    </div>
                    <div className="bg-secondary rounded-2xl p-5 border border-border">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-foreground">Analytical</p>
                        <span className="text-sm text-primary font-black">91%</span>
                      </div>
                      <div className="h-2 w-full bg-card rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-primary rounded-full w-[91%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-base font-bold text-foreground">Today's Tasks</p>
                      <span className="text-xs font-bold text-muted-foreground bg-card px-2 py-1 rounded-md border border-border">2/3 Done</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-medium text-muted-foreground line-through">Quant Practice Set 4</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-medium text-muted-foreground line-through">English Flashcards (20)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-lg border-2 border-border bg-card shrink-0"></div>
                        <span className="text-sm font-bold text-foreground">Mock Test #7 (90 Qs)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-8">Our students secured admission in</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {['Quaid-i-Azam Uni', 'COMSATS', 'FAST-NUCES', 'Air University', 'IST', 'IIU', 'GCU', 'UET'].map((uni, i) => (
              <span key={i} className="font-display text-xl sm:text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors cursor-default">{uni}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Complete Learning Toolkit</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-black leading-[1.1] mb-6 text-foreground">
              Everything you need to<br/><span className="text-primary">learn smarter.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Twelve integrated educational tools designed by top instructors to cover every angle of your NAT preparation.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Target, iconColor: 'text-primary', iconBg: 'bg-primary/10 border-primary/20', title: 'Practice Sessions', desc: 'Topic-wise MCQs with instant AI feedback.' },
              { icon: FileText, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Mock Tests', desc: 'Full 90-question simulated exams timed exactly like the real NAT.' },
              { icon: Archive, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10 border-blue-500/20', title: 'Past Papers', desc: 'Actual previous NAT papers with answer keys and breakdowns.' },
              { icon: CalendarCheck, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10 border-indigo-500/20', title: 'Study Plan Generator', desc: 'AI builds a personalized daily plan based on your target score.' },
              { icon: CheckSquare, iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10 border-purple-500/20', title: 'Daily Tasks', desc: 'Bite-sized daily goals that keep you consistent.' },
              { icon: AlertCircle, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10 border-rose-500/20', title: 'Mistake Reviewer', desc: 'Automatically logs every mistake so you never repeat them.' },
              { icon: Star, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10 border-amber-500/20', title: 'Important Topics', desc: 'High-yield topics identified from past papers to focus your energy.' },
              { icon: Lightbulb, iconColor: 'text-yellow-500', iconBg: 'bg-yellow-500/10 border-yellow-500/20', title: 'Study Tricks', desc: 'Time-saving shortcuts and memory techniques by top scorers.' },
              { icon: Layers, iconColor: 'text-cyan-500', iconBg: 'bg-cyan-500/10 border-cyan-500/20', title: 'Flashcards', desc: 'Spaced-repetition flashcards for formulas and concepts.' },
              { icon: MessageSquareText, iconColor: 'text-green-500', iconBg: 'bg-green-500/10 border-green-500/20', title: 'Smart Feedback', desc: 'Detailed explanations after every question.' },
              { icon: BarChart3, iconColor: 'text-blue-400', iconBg: 'bg-blue-400/10 border-blue-400/20', title: 'Performance Dashboard', desc: 'Visual analytics that reveal progress patterns.' },
              { icon: Trophy, iconColor: 'text-orange-500', iconBg: 'bg-orange-500/10 border-orange-500/20', title: 'Leaderboard', desc: 'Compete with peers across Pakistan and turn prep into a fun challenge.' },
            ].map((feature, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="rounded-3xl p-8 bg-card border-2 border-border hover:border-primary/40 transition-colors shadow-sm h-full flex flex-col group">
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-base font-medium text-muted-foreground leading-relaxed flex-1">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section id="syllabus" className="py-32 bg-secondary/50 border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="text-xs font-bold text-primary tracking-widest uppercase">Complete Syllabus Coverage</span>
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-black leading-[1.1] mb-8 text-foreground">
                Master every<br/><span className="text-primary">subject area.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 font-medium">
                The NAT tests three core areas. We break them down into bite-sized lessons, practice questions, and mock tests so you're fully prepared.
              </p>
              <div className="space-y-8">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-display text-lg font-bold text-foreground">Quantitative Reasoning</h4>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">35% of Test</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border"><div className="h-full bg-primary rounded-full w-[35%]"></div></div>
                  <p className="text-sm font-medium text-muted-foreground mt-4">Arithmetic, Algebra, Geometry, Mensuration.</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-display text-lg font-bold text-foreground">Analytical Reasoning</h4>
                    <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">35% of Test</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border"><div className="h-full bg-emerald-500 rounded-full w-[35%]"></div></div>
                  <p className="text-sm font-medium text-muted-foreground mt-4">Logic, Patterns, Scenarios, Deductions.</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-display text-lg font-bold text-foreground">English Comprehension</h4>
                    <span className="text-sm font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg">30% of Test</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border"><div className="h-full bg-rose-500 rounded-full w-[30%]"></div></div>
                  <p className="text-sm font-medium text-muted-foreground mt-4">Grammar, Vocabulary, Reading Comprehension.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2} className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[40px] blur-2xl -z-10"></div>
              <div className="bg-card rounded-[32px] border-2 border-border shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                  <div>
                    <h3 className="font-display font-black text-2xl text-foreground">Smart Study Plan</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">Generated for 4-week prep</p>
                  </div>
                  <button className="text-sm font-bold text-primary-foreground bg-primary px-4 py-2 rounded-xl shadow-md">Edit Plan</button>
                </div>
                <div className="grid grid-cols-7 gap-3 mb-6">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => <div key={i} className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{d}</div>)}
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(d => (
                    <div key={d} className={`h-12 w-full rounded-xl flex items-center justify-center text-sm font-bold transition-transform hover:scale-105 cursor-default ${
                      d < 5 ? 'bg-primary text-primary-foreground shadow-sm' : 
                      d === 5 ? 'border-2 border-primary text-primary bg-primary/5' : 
                      'bg-secondary border border-border text-muted-foreground'
                    }`}>{d}</div>
                  ))}
                </div>
                <div className="bg-secondary/50 rounded-2xl p-4 border border-border mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Today's Focus</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">Complete Algebra Module & 1 Mock Test</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mock Test Dashboard Demo */}
      <section id="dashboard" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <Reveal className="order-2 lg:order-1 hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-[40px] blur-2xl -z-10"></div>
              <div className="bg-card rounded-[32px] p-8 border-2 border-border shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><FileText className="w-6 h-6 text-primary" /></div>
                    <div>
                      <p className="font-display font-black text-xl text-foreground">Mock Test #7</p>
                      <p className="text-sm font-medium text-muted-foreground">Question 23 of 90</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <span className="text-lg font-mono font-bold text-rose-500">01:42:31</span>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="flex justify-between text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider"><span>Progress</span><span>25%</span></div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border"><div className="h-full bg-primary rounded-full w-[25.5%]"></div></div>
                </div>
                <div className="mb-6">
                  <p className="font-display text-xl font-bold leading-relaxed mb-6 text-foreground">A train travels 240 km in 4 hours. If it maintains the same speed, how far will it travel in 7 hours?</p>
                  <div className="space-y-3">
                    {['380 km', '420 km', '440 km', '480 km'].map((opt, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-colors cursor-default ${i === 1 ? 'border-2 border-primary bg-primary/5 shadow-sm' : 'border-2 border-border bg-card'}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border text-muted-foreground'}`}>
                          {['A','B','C','D'][i]}
                        </div>
                        <span className={`text-base font-medium ${i === 1 ? 'font-bold text-foreground' : 'text-foreground'}`}>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <span className="text-xs font-bold text-emerald-500 tracking-widest uppercase">Real Test Experience</span>
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-black leading-[1.1] mb-8 text-foreground">
                Practice like it's<br/><span className="text-emerald-500">test day.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 font-medium">
                Our mock tests mirror the exact NAT format, timing, and difficulty. By test day, you'll have faced every type of question dozens of times — no surprises, no panic.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  {i:Timer, l:'Duration', v:'120 min', c:'text-blue-500', bg:'bg-blue-500/10 border-blue-500/20'},
                  {i:ListOrdered, l:'Questions', v:'90 MCQs', c:'text-pink-500', bg:'bg-pink-500/10 border-pink-500/20'},
                  {i:Layers, l:'Sections', v:'3 Areas', c:'text-amber-500', bg:'bg-amber-500/10 border-amber-500/20'},
                  {i:Repeat, l:'Attempts', v:'Unlimited', c:'text-emerald-500', bg:'bg-emerald-500/10 border-emerald-500/20'}
                ].map((item, i) => (
                  <div key={i} className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg ${item.bg} border flex items-center justify-center shrink-0`}>
                        <item.i className={`w-4 h-4 ${item.c}`} />
                      </div>
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{item.l}</span>
                    </div>
                    <p className="font-display text-2xl font-black text-foreground">{item.v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-24 bg-card border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 text-center">
          <div><div className="font-display text-5xl md:text-7xl font-black mb-4 text-foreground"><Counter target={12000} suffix="+" /></div><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Students prepared</p></div>
          <div><div className="font-display text-5xl md:text-7xl font-black mb-4 text-primary"><Counter target={1200} suffix="+" /></div><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Practice questions</p></div>
          <div><div className="font-display text-5xl md:text-7xl font-black mb-4 text-emerald-500"><Counter target={50} suffix="+" /></div><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Real past papers</p></div>
          <div><div className="font-display text-5xl md:text-7xl font-black mb-4 text-rose-500"><Counter target={84} suffix="%" /></div><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Average improvement</p></div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-background relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Questions</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-black leading-[1.1] text-foreground">Frequently <span className="text-primary">asked.</span></h2>
          </Reveal>
          <div className="space-y-4">
            {[
              {q: "What is NAT and who conducts it?", a: "The National Aptitude Test (NAT) is conducted by NTS Pakistan. It is required for admission to many undergraduate programs."},
              {q: "Is EntryHive affiliated with NTS?", a: "No, we are an independent platform. However, our content is carefully aligned with the official NAT syllabus."},
              {q: "Can I use EntryHive on mobile?", a: "Yes. EntryHive works seamlessly on any device through your browser. We also offer an Android app."},
            ].map((faq, i) => (
              <div key={i} className="border-2 border-border rounded-2xl p-6 hover:border-primary/40 transition-colors cursor-pointer bg-card shadow-sm" onClick={() => toggleFaq(i)}>
                <div className="w-full flex items-center justify-between text-left gap-4">
                  <span className="font-display text-xl font-bold text-foreground">{faq.q}</span>
                  <div className={`w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45 bg-primary border-primary text-white' : 'text-muted-foreground'}`}>
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-40 mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-card relative overflow-hidden border-t border-border">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl font-black leading-[1.05] mb-8 text-foreground tracking-tight">
              Your university seat<br/>is <span className="text-primary">one click</span> away.
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">Join 12,000+ Pakistani students who chose EntryHive to maximize their NAT score. Start free today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup" className="w-full sm:w-auto btn-primary px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 text-xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                Start Practicing Free <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-foreground font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2"><Star className="w-5 h-5 fill-amber-400 text-amber-400" /> 4.9/5 from 2,400+ reviews</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> No credit card required</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background pt-20 pb-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><GraduationCap className="w-6 h-6 text-primary-foreground" /></div>
                <span className="font-display text-2xl font-black tracking-tight text-foreground">EntryHive</span>
              </Link>
              <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-sm mb-8">Pakistan's most comprehensive NAT preparation platform. Built by educators, powered by AI.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm uppercase tracking-widest mb-6">Platform</h4>
              <ul className="space-y-4 font-medium text-muted-foreground">
                <li><Link to="/practice" className="hover:text-primary transition-colors">Practice</Link></li>
                <li><Link to="/mock-test" className="hover:text-primary transition-colors">Mock Tests</Link></li>
                <li><Link to="/past-papers" className="hover:text-primary transition-colors">Past Papers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-4 font-medium text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><Link to="/legal" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-muted-foreground">
            <p>© 2026 EntryHive. All rights reserved. Made in Pakistan 🇵🇰</p>
            <p>EntryHive is not affiliated with NTS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
