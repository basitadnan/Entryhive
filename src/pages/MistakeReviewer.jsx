import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp, BookOpen, Target, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStaggerReveal } from '@/hooks/useScrollAnimation';
import { getSectionLabel } from '@/lib/questionBank';
import AIExplainButton from '@/components/practice/AIExplainButton';

export default function MistakeReviewer() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [expandedSession, setExpandedSession] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['practice-sessions-mistakes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('PracticeSession').select('id, created_at, score_percentage, section').eq('user_email', user?.email).eq('completed', true);
      if (error) { console.error('MistakeReviewer query error:', error); return []; }
      return data || [];
    },
  });

  // Parse sessions and extract mistakes
  const sessionsWithMistakes = sessions
    .map((session, index) => {
      let questions = [];
      let answers = [];
      try {
        questions = session.questions_json ? JSON.parse(session.questions_json) : [];
        answers = session.answers_json ? JSON.parse(session.answers_json) : [];
      } catch (e) { /* ignore parse errors */ }

      const mistakes = questions
        .map((q, i) => {
          const ans = answers[i];
          if (!ans || ans.isCorrect) return null;
          return {
            question: q,
            selected: ans.selected,
            correct: q.correct,
          };
        })
        .filter(Boolean);

      return {
        ...session,
        sessionNumber: index + 1,
        questions,
        answers,
        mistakes,
        totalQuestions: questions.length,
        correctCount: answers.filter(a => a?.isCorrect).length,
        wrongCount: mistakes.length,
        scorePercent: session.score_percentage || 0,
      };
    })
    .filter(s => s.mistakes.length > 0) // Only show sessions with mistakes
    .reverse(); // Newest first

  const totalMistakes = sessionsWithMistakes.reduce((s, session) => s + session.mistakes.length, 0);

  // Group mistakes by topic
  const mistakesByTopic = {};
  sessionsWithMistakes.forEach(session => {
    session.mistakes.forEach(m => {
      const topic = m.question.topic || 'General';
      if (!mistakesByTopic[topic]) mistakesByTopic[topic] = 0;
      mistakesByTopic[topic]++;
    });
  });
  const topWeakTopics = Object.entries(mistakesByTopic)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleRetakeMistakes = (session) => {
    // Store mistake questions in sessionStorage and start a practice session
    const mistakeQuestions = session.mistakes.map(m => m.question);
    sessionStorage.setItem('retake_mistakes', JSON.stringify(mistakeQuestions));
    navigate(`/practice-session?section=${session.section || 'english'}&count=${mistakeQuestions.length}&retake=mistakes`);
  };

  const handleRetakeAll = () => {
    const allMistakeQuestions = sessionsWithMistakes.flatMap(s => s.mistakes.map(m => m.question));
    // Deduplicate by question id
    const unique = [];
    const seen = new Set();
    allMistakeQuestions.forEach(q => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        unique.push(q);
      }
    });
    sessionStorage.setItem('retake_mistakes', JSON.stringify(unique));
    navigate(`/practice-session?section=english&count=${unique.length}&retake=mistakes`);
  };

  const { containerProps, itemVariants } = useStaggerReveal({ stagger: 0.05 });

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-bold">Loading your mistakes...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto space-y-8 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <Search className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Mistake Reviewer</h1>
          <p className="text-sm text-muted-foreground">Learn from your errors — review and retake</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {sessionsWithMistakes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl border border-border p-12 text-center shadow-sm"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 ring-8 ring-green-500/5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">No Mistakes Yet!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Complete some practice sessions first. Your wrong answers will appear here for review.
          </p>
          <button className="btn-primary py-3.5 px-8 rounded-xl font-bold flex items-center justify-center gap-2 mx-auto" onClick={() => navigate('/practice')}>
            <BookOpen className="w-5 h-5" /> Start Practicing
          </button>
        </motion.div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-2xl text-center shadow-sm">
              <p className="font-display text-3xl font-bold text-rose-500">{totalMistakes}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Mistakes</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-2xl text-center shadow-sm">
              <p className="font-display text-3xl font-bold text-amber-500">{sessionsWithMistakes.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Sessions</p>
            </div>
            <div className="bg-card border border-border p-5 rounded-2xl text-center shadow-sm">
              <p className="font-display text-lg font-bold text-primary truncate">{topWeakTopics[0]?.[0] || '—'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Weakest Topic</p>
            </div>
          </div>

          {/* Weak Topics */}
          {topWeakTopics.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" /> Top Weak Areas
              </h3>
              <div className="space-y-3">
                {topWeakTopics.map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                    <span className="font-bold text-foreground">{topic}</span>
                    <span className="text-xs font-bold bg-rose-500/10 text-rose-500 px-3 py-1 rounded-lg">{count} mistakes</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retake All Button */}
          <button className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20" onClick={handleRetakeAll}>
            <RotateCcw className="w-5 h-5" /> Retake All Mistakes ({totalMistakes} Qs)
          </button>

          {/* Sessions */}
          <motion.div className="space-y-4" {...containerProps}>
            {sessionsWithMistakes.map((session) => {
              const isOpen = expandedSession === session.id;
              return (
                <motion.div key={session.id} variants={itemVariants}>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedSession(isOpen ? null : session.id)}
                      className="w-full p-5 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-foreground">
                            Session {session.sessionNumber} — {getSectionLabel(session.section || 'english')}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.wrongCount} mistakes out of {session.totalQuestions} • Score: {session.scorePercent}%
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-lg">
                            {session.wrongCount} wrong
                          </span>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-4">
                            {session.mistakes.map((m, i) => (
                              <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
                                <div className="flex items-start gap-3 mb-3">
                                  <XCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                                  <p className="font-bold text-foreground">{m.question.question}</p>
                                </div>
                                <div className="space-y-1.5 ml-8">
                                  {m.question.options.map((opt, j) => (
                                    <p
                                      key={j}
                                      className={`text-sm px-3 py-1.5 rounded-lg ${
                                        j === m.correct
                                          ? 'bg-green-500/10 text-green-500 font-bold border border-green-500/20'
                                          : j === m.selected
                                          ? 'bg-rose-500/10 text-rose-500 line-through border border-rose-500/20'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + j)}. {opt}
                                    </p>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-3 ml-8 italic leading-relaxed">{m.question.explanation}</p>
                                <div className="ml-8 mt-2">
                                  <AIExplainButton
                                    question={m.question.question}
                                    options={m.question.options}
                                    correctIndex={m.correct}
                                    explanation={m.question.explanation}
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              className="w-full py-3.5 rounded-xl border border-border bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                              onClick={() => handleRetakeMistakes(session)}
                            >
                              <RotateCcw className="w-4 h-4" /> Retake These {session.wrongCount} Mistakes
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
