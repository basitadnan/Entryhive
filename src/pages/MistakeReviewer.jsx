import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp, BookOpen, Target } from 'lucide-react';
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
      const { data, error } = await supabase.from('PracticeSession').select('*').eq('user_email', user?.email).eq('completed', true);
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
      <div className="p-4 text-center text-muted-foreground mt-10">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        Loading your mistakes...
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 space-y-5 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold">🔍 Mistake Reviewer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Learn from your errors — review and retake your wrong answers
        </p>
      </div>

      {sessionsWithMistakes.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold">No Mistakes Yet!</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Complete some practice sessions first. Your wrong answers will appear here.
          </p>
          <Button className="mt-4 bg-primary" onClick={() => navigate('/practice')}>
            <BookOpen className="w-4 h-4 mr-1" /> Start Practicing
          </Button>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 text-center">
              <p className="text-xl font-bold text-red-400">{totalMistakes}</p>
              <p className="text-xs text-muted-foreground">Total Mistakes</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xl font-bold text-amber-400">{sessionsWithMistakes.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xl font-bold text-primary">{topWeakTopics[0]?.[0] || '—'}</p>
              <p className="text-xs text-muted-foreground">Weakest Topic</p>
            </Card>
          </div>

          {/* Weak Topics */}
          {topWeakTopics.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" /> Top Weak Areas
              </h3>
              <div className="space-y-1.5">
                {topWeakTopics.map(([topic, count]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-sm">{topic}</span>
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{count} mistakes</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Retake All Button */}
          <Button className="w-full bg-primary h-11" onClick={handleRetakeAll}>
            <RotateCcw className="w-4 h-4 mr-2" /> Retake All Mistakes ({totalMistakes} Qs)
          </Button>

          {/* Sessions */}
          <motion.div className="space-y-3" {...containerProps}>
            {sessionsWithMistakes.map((session) => {
              const isOpen = expandedSession === session.id;
              return (
                <motion.div key={session.id} variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => setExpandedSession(isOpen ? null : session.id)}
                      className="w-full p-4 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">
                            Lesson {session.sessionNumber} — {getSectionLabel(session.section || 'english')}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {session.wrongCount} mistakes out of {session.totalQuestions} • Score: {session.scorePercent}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                            {session.wrongCount} wrong
                          </span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                          <div className="px-4 pb-4 space-y-3">
                            {session.mistakes.map((m, i) => (
                              <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/50">
                                <div className="flex items-start gap-2 mb-2">
                                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                  <p className="text-sm font-medium">{m.question.question}</p>
                                </div>
                                <div className="space-y-1 ml-6">
                                  {m.question.options.map((opt, j) => (
                                    <p
                                      key={j}
                                      className={`text-xs px-2 py-1 rounded ${
                                        j === m.correct
                                          ? 'bg-green-500/10 text-green-400 font-medium'
                                          : j === m.selected
                                          ? 'bg-red-500/10 text-red-400 line-through'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + j)}. {opt}
                                    </p>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 ml-6 italic">{m.question.explanation}</p>
                                <div className="ml-6">
                                  <AIExplainButton
                                    question={m.question.question}
                                    options={m.question.options}
                                    correctIndex={m.correct}
                                    explanation={m.question.explanation}
                                  />
                                </div>
                              </div>
                            ))}

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleRetakeMistakes(session)}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Retake These {session.wrongCount} Mistakes
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
