import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { ArrowLeft, BookOpen, Filter, Lock, ChevronDown, ChevronUp, CheckCircle2, PlayCircle, Zap } from 'lucide-react';
import { getAllSections, getSectionLabel, getSectionIcon } from '@/lib/questionBank';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

const FREE_LIMITS = { english: 3, analytical: 3, quantitative: 3 };
const SUBJECT_SECTIONS = ['physics', 'chemistry', 'mathematics', 'biology', 'computer_science', 'commerce', 'accounting', 'economics'];

function getFreeLimitForSection(section) {
  if (FREE_LIMITS[section] !== undefined) return FREE_LIMITS[section];
  if (SUBJECT_SECTIONS.includes(section)) return 1;
  return 1;
}

// Sub-topic definitions
const SUB_TOPICS = {
  english: [
    { id: 'all', label: 'All Topics' },
    { id: 'synonyms', label: 'Synonyms' },
    { id: 'antonyms', label: 'Antonyms' },
    { id: 'comprehension', label: 'Comprehension' },
    { id: 'analogies', label: 'Analogies' },
    { id: 'sentence_completion', label: 'Sentence Completion' },
    { id: 'grammar', label: 'Grammar' },
  ],
  analytical: [
    { id: 'all', label: 'All Topics' },
    { id: 'statements_based', label: 'Statements Based (Country/Society)' },
    { id: 'scenario_based', label: 'Scenario Based' },
  ],
  quantitative: [
    { id: 'all', label: 'All Topics' },
    { id: 'arithmetic', label: 'Arithmetic' },
    { id: 'algebra', label: 'Algebra' },
    { id: 'geometry', label: 'Geometry' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'percentage', label: 'Percentage' },
    { id: 'work_problems', label: 'Work Problems' },
    { id: 'age_problems', label: 'Age Problems' },
    { id: 'probability', label: 'Probability' },
    { id: 'arithmetic_progression', label: 'Arithmetic Progression' },
    { id: 'geometric_progression', label: 'Geometric Progression' },
    { id: 'permutation', label: 'Permutation' },
    { id: 'combination', label: 'Combination' },
    { id: 'slope', label: 'Slope & Coordinates' },
  ],
};

export default function Practice() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [section, setSection] = useState('');
  const [subTopic, setSubTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [showSubTopics, setShowSubTopics] = useState(false);

  const sections = getAllSections(user?.nat_group);
  const isPremium = user?.is_premium === true;
  const currentSubTopics = SUB_TOPICS[section] || null;

  const { data: allSessions = [] } = useQuery({
    queryKey: ['practice-sessions-all', user?.email],
    queryFn: () => base44.entities.PracticeSession.list('-created_date', 200),
    enabled: !!user?.email,
  });

  const completedSessions = allSessions.filter(s => s.completed && s.user_email === user?.email);
  function getCompletedCount(sec) { return completedSessions.filter(s => s.section === sec).length; }
  function canAccessSection(sec) { if (isPremium) return true; return getCompletedCount(sec) < getFreeLimitForSection(sec); }
  function getSectionStatus(sec) { if (isPremium) return null; const limit = getFreeLimitForSection(sec); const used = getCompletedCount(sec); if (used >= limit) return `🔒 ${used}/${limit} used`; return `${used}/${limit} free`; }

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const handleSelectSection = (s) => {
    sounds.select();
    setSection(s);
    setSubTopic('all');
    setShowSubTopics(!!SUB_TOPICS[s]);
  };

  const handleStart = () => {
    if (!section) return;
    sounds.click();
    if (!canAccessSection(section)) { navigate('/premium'); return; }
    const params = `section=${section}&difficulty=${difficulty}&count=${questionCount}${subTopic !== 'all' ? `&subTopic=${subTopic}` : ''}`;
    navigate(`/practice-session?${params}`);
  };

  const handleQuickStart = (sec) => {
    sounds.click();
    if (!canAccessSection(sec)) { navigate('/premium'); return; }
    navigate(`/practice-session?section=${sec}&difficulty=all&count=10`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Practice Mode</h1>
          <p className="text-sm text-muted-foreground">Topic-wise practice with instant feedback</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {!isPremium && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm tracking-wider uppercase">Free</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Free limits:</strong> Eng/Ana/Quant: 3 each • Subject: 1 each.
            </p>
          </div>
          <button onClick={() => navigate('/premium')} className="btn-primary py-2.5 px-6 rounded-xl font-bold shrink-0">
            Get Premium
          </button>
        </div>
      )}

      {/* Main Configuration Card */}
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

        {/* Section Selection */}
        <div className="mb-10">
          <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">1. Select Section</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((s) => {
              const locked = !canAccessSection(s);
              const status = getSectionStatus(s);
              const isSelected = section === s;
              
              return (
                <button
                  key={s}
                  onClick={() => handleSelectSection(s)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : locked ? 'border-border bg-secondary/50 opacity-70 cursor-not-allowed' : 'border-border hover:border-primary/50 hover:bg-secondary/30 bg-card'
                  }`}
                  disabled={locked && !isSelected}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isSelected ? 'bg-primary/10' : 'bg-secondary border border-border'}`}>
                      {getSectionIcon(s)}
                    </div>
                    <div className="text-left">
                      <span className={`font-bold block ${isSelected ? 'text-primary' : 'text-foreground'}`}>{getSectionLabel(s)}</span>
                      {status && <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 block ${locked ? 'text-rose-500' : 'text-muted-foreground'}`}>{status}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {locked && <Lock className="w-5 h-5 text-rose-500" />}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-border'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-topics */}
        <AnimatePresence>
          {section && currentSubTopics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                <button
                  className="w-full flex items-center justify-between font-bold text-foreground mb-4"
                  onClick={() => setShowSubTopics(v => !v)}
                >
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">2. Specific Topic (Optional)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">{currentSubTopics.find(t => t.id === subTopic)?.label || 'All Topics'}</span>
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                      {showSubTopics ? <ChevronUp className="w-4 h-4 text-foreground" /> : <ChevronDown className="w-4 h-4 text-foreground" />}
                    </div>
                  </div>
                </button>
                <AnimatePresence>
                  {showSubTopics && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
                    >
                      {currentSubTopics.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { sounds.select(); setSubTopic(t.id); }}
                          className={`text-left p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                            subTopic === t.id ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border hover:border-primary/40 text-foreground bg-card'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Grid */}
        <div className="grid md:grid-cols-2 gap-10 mb-10">
          
          {/* Difficulty */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">3. Difficulty</p>
            <div className="grid grid-cols-2 gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { sounds.select(); setDifficulty(d.value); }}
                  className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${
                    difficulty === d.value ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">4. Number of Questions</p>
              <span className="text-primary font-bold text-xl bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">
                {questionCount}
              </span>
            </div>
            
            <div className="px-2">
              <input 
                type="range" 
                min="5" 
                max="20" 
                step="5" 
                value={questionCount} 
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-3 bg-secondary border border-border rounded-full appearance-none cursor-pointer range-primary"
              />
              <div className="flex justify-between text-xs font-bold text-muted-foreground mt-4 px-1">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-xl ${
            !section ? 'bg-secondary border-2 border-border text-muted-foreground cursor-not-allowed' : 'btn-primary shadow-xl shadow-primary/20 hover:scale-[1.02]'
          }`}
          disabled={!section}
          onClick={handleStart}
        >
          <PlayCircle className="w-7 h-7" />
          Start Practice Session
        </button>
      </motion.div>

      {/* Quick Start Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">Quick Start</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.slice(0, 4).map((s) => {
            const locked = !canAccessSection(s);
            return (
              <button
                key={s}
                onClick={() => handleQuickStart(s)}
                className={`bg-card border-2 border-border p-5 rounded-3xl text-left transition-all group ${locked ? 'opacity-60 bg-secondary/50 cursor-not-allowed' : 'hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5'}`}
                disabled={locked}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-3xl w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${locked ? 'bg-secondary border-border' : 'bg-primary/5 border-primary/20 group-hover:bg-primary/10'}`}>{getSectionIcon(s)}</span>
                  {locked && <Lock className="w-5 h-5 text-rose-500" />}
                </div>
                <p className="font-display font-bold text-foreground text-lg mb-1 leading-tight group-hover:text-primary transition-colors">{getSectionLabel(s)}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">10 Qs • Random</p>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}