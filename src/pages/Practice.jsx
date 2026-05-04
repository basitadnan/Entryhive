import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, BookOpen, Filter, Lock, ChevronDown, ChevronUp } from 'lucide-react';
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
    { id: 'all', label: '📚 All Topics' },
    { id: 'synonyms', label: '🔤 Synonyms' },
    { id: 'antonyms', label: '🔁 Antonyms' },
    { id: 'comprehension', label: '📖 Comprehension' },
    { id: 'analogies', label: '🔗 Analogies' },
    { id: 'sentence_completion', label: '✏️ Sentence Completion' },
    { id: 'grammar', label: '📝 Grammar' },
  ],
  analytical: [
    { id: 'all', label: '🧠 All Topics' },
    { id: 'statements_based', label: '🌍 Statements Based (Country/Society)' },
    { id: 'scenario_based', label: '🎯 Scenario Based' },
  ],
  quantitative: [
    { id: 'all', label: '🔢 All Topics' },
    { id: 'arithmetic', label: '➕ Arithmetic' },
    { id: 'algebra', label: '🔣 Algebra' },
    { id: 'geometry', label: '📐 Geometry' },
    { id: 'statistics', label: '📊 Statistics' },
    { id: 'percentage', label: '💯 Percentage' },
    { id: 'work_problems', label: '🔧 Work Problems' },
    { id: 'age_problems', label: '🎂 Age Problems' },
    { id: 'probability', label: '🎲 Probability' },
    { id: 'arithmetic_progression', label: '📈 Arithmetic Progression' },
    { id: 'geometric_progression', label: '🔺 Geometric Progression' },
    { id: 'permutation', label: '🔀 Permutation' },
    { id: 'combination', label: '🃏 Combination' },
    { id: 'slope', label: '📉 Slope & Coordinates' },
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
  function getInProgressSession(sec) { return allSessions.find(s => !s.completed && s.user_email === user?.email && s.section === sec && s.questions_json) || null; }
  function canAccessSection(sec) { if (isPremium) return true; return getCompletedCount(sec) < getFreeLimitForSection(sec); }
  function getSectionStatus(sec) { if (isPremium) return null; const limit = getFreeLimitForSection(sec); const used = getCompletedCount(sec); if (used >= limit) return `🔒 ${used}/${limit} used`; return `${used}/${limit} free`; }

  const inProgressSession = section ? getInProgressSession(section) : null;
  const hasInProgress = !!inProgressSession;

  const difficulties = [
    { value: 'all', label: 'All' },
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
    if (hasInProgress) {
      navigate(`/practice-session?${params}&resume=${inProgressSession.id}`);
    } else {
      navigate(`/practice-session?${params}`);
    }
  };

  const handleQuickStart = (sec) => {
    sounds.click();
    if (!canAccessSection(sec)) { navigate('/premium'); return; }
    const existing = getInProgressSession(sec);
    if (existing) {
      navigate(`/practice-session?section=${sec}&difficulty=all&count=10&resume=${existing.id}`);
    } else {
      navigate(`/practice-session?section=${sec}&difficulty=all&count=10`);
    }
  };

  return (
    <motion.div
      className="p-4 space-y-5 pb-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <button onClick={() => { sounds.click(); navigate('/'); }} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-blue-400" />
        <div>
          <h1 className="text-xl font-bold">Practice Mode</h1>
          <p className="text-sm text-muted-foreground">Topic-wise practice with instant feedback</p>
        </div>
      </div>

      {!isPremium && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-3 bg-blue-500/10 border-blue-500/30">
            <p className="text-sm text-blue-300">
              🆓 <strong>Free limits:</strong> Eng/Ana/Quant: 3 each · Subject: 1 each.{' '}
              <button onClick={() => navigate('/premium')} className="underline font-semibold text-primary">Get Premium</button>
            </p>
          </Card>
        </motion.div>
      )}

      {/* Configure */}
      <Card className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Configure Your Session</h3>
        </div>

        {/* Section */}
        <div>
          <p className="text-sm font-medium mb-3">Section *</p>
          <div className="space-y-2">
            {sections.map((s, i) => {
              const locked = !canAccessSection(s);
              const status = getSectionStatus(s);
              const inProgress = getInProgressSession(s);
              return (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleSelectSection(s)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    section === s ? 'border-primary bg-primary/5' : locked ? 'border-border opacity-60' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span>{getSectionIcon(s)}</span>
                    <div className="text-left">
                      <span className="font-medium text-sm">{getSectionLabel(s)}</span>
                      {inProgress && <p className="text-xs mt-0.5 text-amber-400">⚡ Resume available</p>}
                      {!inProgress && status && <p className={`text-xs mt-0.5 ${locked ? 'text-red-400' : 'text-muted-foreground'}`}>{status}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {locked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${section === s ? 'border-primary' : 'border-muted-foreground/30'}`}>
                      {section === s && <motion.div layoutId="sectionDot" className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                </motion.button>
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
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-3"
                onClick={() => setShowSubTopics(v => !v)}
              >
                {showSubTopics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Sub-Topic: <span className="text-foreground">{currentSubTopics.find(t => t.id === subTopic)?.label || 'All'}</span>
              </button>
              <AnimatePresence>
                {showSubTopics && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {currentSubTopics.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { sounds.select(); setSubTopic(t.id); }}
                        className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                          subTopic === t.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {hasInProgress && section && (
          <Card className="p-3 bg-amber-500/10 border-amber-500/30">
            <p className="text-sm text-amber-300">⚡ You have an unfinished {getSectionLabel(section)} session. Starting will <strong>resume</strong> it.</p>
          </Card>
        )}

        {/* Difficulty */}
        {!hasInProgress && (
          <div>
            <p className="text-sm font-medium mb-3">Difficulty</p>
            <div className="flex gap-2 flex-wrap">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { sounds.select(); setDifficulty(d.value); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${difficulty === d.value ? 'bg-primary text-primary-foreground scale-105' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Count */}
        {!hasInProgress && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium">Number of Questions:</p>
              <motion.span key={questionCount} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-primary font-bold text-lg">
                {questionCount}
              </motion.span>
            </div>
            <Slider value={[questionCount]} onValueChange={(v) => setQuestionCount(v[0])} min={5} max={20} step={5} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>5</span><span>20</span></div>
          </div>
        )}

        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-semibold"
            disabled={!section}
            onClick={handleStart}
          >
            {hasInProgress && section ? '▶ Resume Session' : 'Start Practice Session →'}
          </Button>
        </motion.div>
      </Card>

      {/* Quick Start */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Start</p>
        <div className="grid grid-cols-2 gap-2">
          {sections.slice(0, 4).map((s, i) => {
            const locked = !canAccessSection(s);
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className={`p-3 cursor-pointer hover:bg-secondary/50 transition-colors h-full ${locked ? 'opacity-60' : ''}`}
                  onClick={() => handleQuickStart(s)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{getSectionIcon(s)}</span>
                    {locked && <Lock className="w-3 h-3 text-amber-400" />}
                  </div>
                  <p className="font-medium text-sm mt-1">{getSectionLabel(s)}</p>
                  <p className="text-xs text-muted-foreground">10 random questions</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}