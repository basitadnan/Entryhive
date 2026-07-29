import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, AlertTriangle, CheckCircle2, Lock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MockTest() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const isPremium = user?.is_premium === true;
  const mockCount = user?.mock_count || 0;
  const canAccess = isPremium || mockCount < 1;

  const groupLabel = {
    'NAT-IE': 'Pre-Engineering',
    'NAT-IM': 'Pre-Medical',
    'NAT-ICS': 'Computer Science',
  }[user?.nat_group] || 'General Group';

  const handleStart = () => {
    if (!canAccess) {
      navigate('/premium');
      return;
    }
    navigate('/mock-test-session');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent))]/10 flex items-center justify-center border border-[hsl(var(--accent))]/20">
          <FileText className="w-6 h-6 text-[hsl(var(--accent))]" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Full Mock Test</h1>
          <p className="text-sm text-muted-foreground">Simulate the real NAT-I Exam Environment</p>
        </div>
      </div>

      {!canAccess && (
        <div className="bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))]/20 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[hsl(var(--accent))]" />
            </div>
            <p className="text-sm text-foreground">
              <strong>Free Limit Reached:</strong> You have used your 1 free mock test.
            </p>
          </div>
          <button onClick={() => navigate('/premium')} className="btn-primary py-2 px-4 text-sm shrink-0 pulse-glow">
            Unlock Unlimited Mocks
          </button>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-card rounded-3xl border border-border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Test Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-muted-foreground">1</div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Target Group</p>
                      <p className="text-xs text-muted-foreground">Based on your profile</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg text-sm">{groupLabel}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-muted-foreground">2</div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Total Questions</p>
                      <p className="text-xs text-muted-foreground">Standard NAT format</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground bg-background px-3 py-1 rounded-lg text-sm border border-border">90 MCQs</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-muted-foreground">3</div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Time Limit</p>
                      <p className="text-xs text-muted-foreground">Strictly timed</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground bg-background px-3 py-1 rounded-lg text-sm border border-border flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" /> 120 Mins
                  </span>
                </div>
              </div>
            </div>
            
            <button
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-lg ${
                !canAccess ? 'bg-secondary text-muted-foreground border border-border shadow-none cursor-not-allowed' : 'btn-primary pulse-glow'
              }`}
              onClick={handleStart}
            >
              <Clock className="w-6 h-6" />
              {canAccess ? 'Start Exam Simulation' : 'Unlock to Start'}
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="bg-[hsl(var(--accent))]/5 border border-[hsl(var(--accent))]/20 rounded-2xl p-6">
              <h3 className="font-display font-bold text-[hsl(var(--accent))] flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" /> Important Instructions
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 shrink-0" />
                  <span>The timer runs continuously once started and <strong>cannot be paused</strong>.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 shrink-0" />
                  <span>You can freely navigate between different sections and questions.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 shrink-0" />
                  <span>Unanswered questions will be marked as incorrect. No negative marking applies.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))] mt-0.5 shrink-0" />
                  <span>Make sure you have a stable internet connection before beginning.</span>
                </li>
              </ul>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
              <h3 className="font-bold text-foreground text-sm mb-3">Syllabus Breakdown</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span>English</span>
                  <span className="font-medium text-foreground">20 MCQs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Analytical</span>
                  <span className="font-medium text-foreground">20 MCQs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quantitative</span>
                  <span className="font-medium text-foreground">20 MCQs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Subject Specific</span>
                  <span className="font-medium text-foreground">30 MCQs</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}