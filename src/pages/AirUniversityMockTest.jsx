import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, PlayCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { sounds } from '@/lib/sounds';

export default function AirUniversityMockTest() {
  const navigate = useNavigate();
  const [track, setTrack] = useState('');

  const TRACKS = [
    { id: 'pre-engineering', label: 'Pre-Engineering' },
    { id: 'pre-medical', label: 'Pre-Medical' },
    { id: 'computer-science', label: 'Computer Science' }
  ];

  const GROUP_MAP = {
    'pre-engineering': 'AU-Pre-Engineering',
    'pre-medical': 'AU-Pre-Medical',
    'computer-science': 'AU-Computer-Science'
  };

  const handleStart = () => {
    if (!track) return;
    sounds.click();
    const auGroup = GROUP_MAP[track];
    navigate(`/au-mock-test-session?group=${auGroup}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <FileText className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Air University Mock Tests</h1>
          <p className="text-sm text-muted-foreground">Full-length mock exams simulating the real pattern</p>
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
          <h2 className="font-display text-xl font-bold text-foreground">Select Your Exam</h2>
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
                  onClick={() => { sounds.select(); setTrack(t.id); }}
                  className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/10' : 'border-border hover:border-indigo-500/50 hover:bg-secondary/30 bg-card'
                  }`}
                >
                  <span className={`font-bold block text-lg ${isSelected ? 'text-indigo-500' : 'text-foreground'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-xl ${
            !track ? 'bg-secondary border-2 border-border text-muted-foreground cursor-not-allowed' : 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02]'
          }`}
          disabled={!track}
          onClick={handleStart}
        >
          <PlayCircle className="w-7 h-7" />
          Start Mock Test
        </button>
      </motion.div>
    </div>
  );
}
