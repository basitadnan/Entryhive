import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BookOpen, ArrowLeft, PlayCircle, Filter, Lock, Crown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';

export default function FastPractice() {
  const navigate = useNavigate();
  const { user } = useOutletContext();
  const [subject, setSubject] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const isPremium = user?.is_premium === true && !user?.is_on_trial;
  const freePracticesStarted = parseInt(localStorage.getItem('fast_free_practices_started') || '0', 10);


  const SUBJECTS = [
    { id: 'fast_english', label: 'English' },
    { id: 'fast_basic_maths', label: 'Basic Mathematics' },
    { id: 'fast_advance_maths', label: 'Advance Mathematics' },
    { id: 'fast_iq', label: 'Intelligence (IQ)' }
  ];

  const handleStart = () => {
    if (!subject) return;
    sounds.click();
    
    if (!isPremium) {
      if (freePracticesStarted >= 3) {
        setShowPaywall(true);
        return;
      }
      localStorage.setItem('fast_free_practices_started', (freePracticesStarted + 1).toString());
    }
    
    navigate(`/fast-practice-session?section=${subject}&difficulty=all&count=10`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <BookOpen className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">FAST University Practice</h1>
          <p className="text-sm text-muted-foreground">Tailored practice sessions for FAST NU patterns</p>
        </div>
      </div>

      <button onClick={() => navigate('/fast')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      {/* Configuration Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Filter className="w-5 h-5 text-indigo-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">Configure Your Session</h2>
        </div>

        {/* Subject Selection */}
        <div className="mb-10">
          <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Select Subject to Practice</p>
          <div className="grid grid-cols-2 gap-4">
            {SUBJECTS.map((s) => {
              const isSelected = subject === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { sounds.select(); setSubject(s.id); }}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                    isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border hover:border-primary/50 hover:bg-secondary/30 bg-card'
                  }`}
                >
                  <span className={`font-bold block text-lg ${isSelected ? 'text-primary' : 'text-foreground'}`}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <div className="space-y-4">
          <button
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-xl ${
              !subject ? 'bg-secondary border-2 border-border text-muted-foreground cursor-not-allowed' : 'btn-primary shadow-xl shadow-primary/20 hover:scale-[1.02]'
            }`}
            disabled={!subject}
            onClick={handleStart}
          >
            <PlayCircle className="w-7 h-7" />
            Start Practice Session
          </button>
          
          {!isPremium && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {3 - freePracticesStarted > 0 ? (
                <>You have <span className="font-bold text-foreground">{3 - freePracticesStarted}</span> free practice session(s) remaining.</>
              ) : (
                <span className="text-rose-500 font-bold flex items-center justify-center gap-1.5"><Lock className="w-4 h-4" /> Free limit reached</span>
              )}
            </p>
          )}
        </div>
      </motion.div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-8 rounded-3xl max-w-md w-full border-2 border-primary/20 shadow-xl relative"
          >
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-center mb-2">Limit Reached</h3>
            <p className="text-center text-muted-foreground mb-6 font-medium">You have used all 3 free FAST practice sessions. Upgrade to Premium for unlimited access!</p>
            <button onClick={() => navigate('/premium')} className="btn-primary w-full py-4 rounded-xl font-bold text-lg">
              Unlock Premium
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
