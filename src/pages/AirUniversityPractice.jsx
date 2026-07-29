import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, PlayCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';

export default function AirUniversityPractice() {
  const navigate = useNavigate();
  const [track, setTrack] = useState('');
  const [subject, setSubject] = useState('');

  const TRACKS = [
    { id: 'pre-engineering', label: 'Pre-Engineering' },
    { id: 'pre-medical', label: 'Pre-Medical' },
    { id: 'computer-science', label: 'Computer Science' }
  ];

  const COMMON_SUBJECTS = [
    { id: 'english', label: 'English' },
    { id: 'analytical', label: 'Analytical Reasoning' },
    { id: 'quantitative', label: 'Quantitative Reasoning' }
  ];

  const TRACK_SUBJECTS = {
    'pre-engineering': [...COMMON_SUBJECTS, { id: 'physics', label: 'Physics' }, { id: 'chemistry', label: 'Chemistry' }, { id: 'mathematics', label: 'Mathematics' }],
    'pre-medical': [...COMMON_SUBJECTS, { id: 'physics', label: 'Physics' }, { id: 'chemistry', label: 'Chemistry' }, { id: 'biology', label: 'Biology' }],
    'computer-science': [...COMMON_SUBJECTS, { id: 'physics', label: 'Physics' }, { id: 'computer_science', label: 'Computer Science' }, { id: 'mathematics', label: 'Mathematics' }]
  };

  const handleStart = () => {
    if (!track || !subject) return;
    sounds.click();
    navigate(`/au-practice-session?section=${subject}&difficulty=all&count=10&auTrack=${track}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <BookOpen className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Air University Practice</h1>
          <p className="text-sm text-muted-foreground">Tailored practice sessions for your track</p>
        </div>
      </div>

      <button onClick={() => navigate('/air-university')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
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

        {/* Track Selection */}
        <div className="mb-10">
          <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">1. Select Your Track</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRACKS.map((t) => {
              const isSelected = track === t.id;
              
              return (
                <button
                  key={t.id}
                  onClick={() => { sounds.select(); setTrack(t.id); setSubject(''); }}
                  className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border hover:border-primary/50 hover:bg-secondary/30 bg-card'
                  }`}
                >
                  <span className={`font-bold block text-lg ${isSelected ? 'text-primary' : 'text-foreground'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selection */}
        {track && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-10"
          >
            <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">2. Select Subject to Practice</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TRACK_SUBJECTS[track].map((s) => {
                const isSelected = subject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { sounds.select(); setSubject(s.id); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        <button
          className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-xl ${
            !track || !subject ? 'bg-secondary border-2 border-border text-muted-foreground cursor-not-allowed' : 'btn-primary shadow-xl shadow-primary/20 hover:scale-[1.02]'
          }`}
          disabled={!track || !subject}
          onClick={handleStart}
        >
          <PlayCircle className="w-7 h-7" />
          Start Practice Session
        </button>
      </motion.div>
    </div>
  );
}
