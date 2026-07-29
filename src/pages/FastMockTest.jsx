import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, PlayCircle, Info, Lock, Crown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';
import { useAuth } from '@/lib/AuthContext';

export default function FastMockTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const isPremium = user?.is_premium === true && !user?.is_on_trial;
  const freeMocksStarted = parseInt(localStorage.getItem('fast_free_mocks_started') || '0', 10);

  const handleStart = () => {
    sounds.click();
    
    if (!isPremium) {
      if (freeMocksStarted >= 1) {
        setShowPaywall(true);
        return;
      }
      localStorage.setItem('fast_free_mocks_started', (freeMocksStarted + 1).toString());
    }
    
    navigate(`/fast-mock-session?group=FAST`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <button onClick={() => navigate('/fast')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            FAST NU Mock Test
            {isPremium && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Premium</span>}
          </h1>
          <p className="text-muted-foreground mt-2">Full-length, timed simulations based on past papers</p>
        </div>
      </div>

      {/* Configuration Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Standard FAST Format</h2>
            <p className="text-sm text-muted-foreground">120 MCQs • 120 Minutes</p>
          </div>
        </div>

        <div className="mb-10 space-y-4">
          <div className="bg-secondary/50 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Exam Breakdown</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center"><span className="text-muted-foreground">Advance Mathematics</span> <span className="font-bold">50 Questions</span></li>
              <li className="flex justify-between items-center"><span className="text-muted-foreground">English</span> <span className="font-bold">30 Questions <span className="text-xs text-primary font-normal">(0.33 marks each = 10 marks)</span></span></li>
              <li className="flex justify-between items-center"><span className="text-muted-foreground">Basic Mathematics</span> <span className="font-bold">20 Questions</span></li>
              <li className="flex justify-between items-center"><span className="text-muted-foreground">Intelligence (IQ)</span> <span className="font-bold">20 Questions</span></li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        <div className="space-y-4">
          <button
            className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02]`}
            onClick={handleStart}
          >
            <PlayCircle className="w-7 h-7" />
            Start Mock Test
          </button>
          
          {!isPremium && (
            <p className="text-center text-sm font-medium text-muted-foreground">
              {1 - freeMocksStarted > 0 ? (
                <>You have <span className="font-bold text-foreground">{1 - freeMocksStarted}</span> free mock test remaining.</>
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
            <p className="text-center text-muted-foreground mb-6 font-medium">You have already taken your 1 free FAST mock test. Upgrade to Premium for unlimited mock tests!</p>
            <button onClick={() => navigate('/premium')} className="btn-primary w-full py-4 rounded-xl font-bold text-lg">
              Unlock Premium
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
