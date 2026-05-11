import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { getQuestions, getSectionLabel } from '@/lib/questionBank';
import SessionFeedback from '@/components/practice/SessionFeedback';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

export default function PracticeSession() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const section = params.get('section') || 'english';
  const difficulty = params.get('difficulty') || 'all';
  const count = parseInt(params.get('count') || '10');
  const resumeId = params.get('resume');
  const subTopic = params.get('subTopic') || null;

  const [sessionId, setSessionId] = useState(null); // DB record ID
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]); // [{questionId, selected, correct, isCorrect}]
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const savingRef = useRef(false);

  // On mount: either resume existing session or start new one
  useEffect(() => {
    async function init() {
      if (resumeId) {
        // Load existing in-progress session by ID
        try {
          const { data: allSessions, error } = await supabase.from('PracticeSession').select('*').order('created_date', { ascending: false }).limit(200);
          if (!error && allSessions) {
            const existing = allSessions.find(s => s.id === resumeId && !s.completed);
            if (existing && existing.questions_json) {
              const parsedQs = JSON.parse(existing.questions_json);
              const parsedAnswers = existing.answers_json ? JSON.parse(existing.answers_json) : [];
              setSessionId(existing.id);
              setQuestions(parsedQs);
              setAnswers(parsedAnswers);
              setCurrentIndex(parsedAnswers.length);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          // fall through to create new
        }
      }

      // 1. Get questions from local bank (includes hardcoded + Bank tab questions)
      let qs = getQuestions(section, difficulty, count, [], subTopic);

      // 2. Fetch questions from Supabase for this section
      try {
        const { data: dbQs, error: dbError } = await supabase
          .from('questions')
          .select('*')
          .eq('section', section.toLowerCase())
          .eq('is_past_paper', false)
          .limit(count);

        if (!dbError && dbQs && dbQs.length > 0) {
          // Format Supabase questions to match app format
          const formattedDbQs = dbQs.map(q => ({
            id: q.id,
            question: q.question_text,
            options: q.options,
            correct: q.correct_answer_index,
            explanation: q.explanation,
            difficulty: q.difficulty
          }));
          
          // Combine and shuffle (limit back to desired count)
          qs = [...qs, ...formattedDbQs].sort(() => Math.random() - 0.5).slice(0, count);
        }
      } catch (e) {
        console.error('Failed to fetch from Supabase:', e);
      }

      const { data: record, error } = await supabase.from('PracticeSession').insert({
        user_email: user.email,
        section,
        difficulty,
        total_questions: qs.length,
        correct_answers: 0,
        wrong_answers: 0,
        score_percentage: 0,
        questions_json: JSON.stringify(qs),
        answers_json: '[]',
        completed: false,
      }).select().single();
      
      if (error) {
        console.error('Failed to create session:', error);
        return;
      }
      
      setSessionId(record.id);
      setQuestions(qs);
      setLoading(false);
    }
    init();
  }, []);

  // Auto-save progress whenever answers change
  useEffect(() => {
    if (!sessionId || answers.length === 0 || finished) return;
    if (savingRef.current) return;
    savingRef.current = true;
    supabase.from('PracticeSession').update({
      answers_json: JSON.stringify(answers),
      correct_answers: answers.filter(a => a.isCorrect).length,
      wrong_answers: answers.filter(a => !a.isCorrect).length,
    }).eq('id', sessionId).then(() => { savingRef.current = false; });
  }, [answers]);

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100 : 0;

  const handleSelect = (optionIndex) => {
    if (showResult) return;
    const isCorrect = optionIndex === currentQ.correct;
    if (isCorrect) sounds.correct();
    else sounds.wrong();
    setSelectedAnswer(optionIndex);
    setShowResult(true);
    setAnswers(prev => [...prev, {
      questionId: currentQ.id,
      selected: optionIndex,
      correct: currentQ.correct,
      isCorrect,
    }]);
  };

  const handleNext = () => {
    sounds.click();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      sounds.vibrate(200); // Strong vibration on finish
      finishSession();
    }
  };

  const finishSession = async () => {
    const allAnswers = answers;
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);

    // Mark session as completed
    await supabase.from('PracticeSession').update({
      answers_json: JSON.stringify(allAnswers),
      correct_answers: correctCount,
      wrong_answers: questions.length - correctCount,
      score_percentage: scorePercent,
      completed: true,
    }).eq('id', sessionId);

    // Update practice count
    const newCount = (user.practice_count || 0) + 1;
    await base44.auth.updateMe({ practice_count: newCount });
    setUser(prev => ({ ...prev, practice_count: newCount }));

    setFinished(true);
    sounds.complete();
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground mt-10">Loading session...</div>;
  }

  if (finished) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="p-4 space-y-5">
        <Card className="p-6 text-center">
          <div className="text-4xl mb-3">{scorePercent >= 70 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold mb-1">Session Complete!</h2>
          <p className="text-muted-foreground">{getSectionLabel(section)}</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-2xl font-bold text-primary">{scorePercent}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{correctCount}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{questions.length - correctCount}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
          </div>
        </Card>

        {/* Weak Area Analysis */}
        <WeakAreaAnalysis questions={questions} answers={answers} />

        {/* AI Feedback */}
        <SessionFeedback answers={answers} questions={questions} section={section} scorePercent={scorePercent} />

        {/* Review */}
        <div className="space-y-3">
          <h3 className="font-semibold">Review Answers</h3>
          {questions.map((q, i) => {
            const ans = answers[i];
            return (
              <Card key={q.id} className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  {ans?.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 mt-0.5" />}
                  <p className="text-sm font-medium">{q.question}</p>
                </div>
                <div className="space-y-1 ml-6">
                  {q.options.map((opt, j) => (
                    <p key={j} className={`text-xs px-2 py-1 rounded ${j === q.correct ? 'bg-green-500/10 text-green-400' : j === ans?.selected && !ans?.isCorrect ? 'bg-red-500/10 text-red-400' : 'text-muted-foreground'}`}>
                      {String.fromCharCode(65 + j)}. {opt}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-6 italic">{q.explanation}</p>
                <div className="ml-6">
                  <AIExplainButton question={q.question} options={q.options} correctIndex={q.correct} explanation={q.explanation} />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/practice')}>Back to Practice</Button>
          <Button className="flex-1 bg-primary" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return <div className="p-4 text-center text-muted-foreground">No questions available.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { sounds.click(); navigate('/practice'); }} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <motion.span key={currentIndex} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-sm font-medium">
          {currentIndex + 1} / {questions.length}
        </motion.span>
      </div>

      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-5">
            <span className={`text-xs px-2 py-0.5 rounded-full mb-3 inline-block ${currentQ.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' : currentQ.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
              {currentQ.difficulty}
            </span>
            {currentQ.topic && <p className="text-xs text-primary/70 mb-1 font-semibold">{currentQ.topic}</p>}
            <h3 className="font-semibold text-base leading-relaxed mb-5">{currentQ.question}</h3>

            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                let classes = 'w-full text-left p-3 rounded-lg border transition-all text-sm ';
                if (!showResult) {
                  classes += selectedAnswer === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50';
                } else {
                  if (i === currentQ.correct) classes += 'border-green-500 bg-green-500/10 text-green-400';
                  else if (i === selectedAnswer) classes += 'border-red-500 bg-red-500/10 text-red-400';
                  else classes += 'border-border opacity-50';
                }
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    className={classes}
                    onClick={() => handleSelect(i)}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-lg bg-secondary"
                >
                  {selectedAnswer === currentQ.correct
                    ? <p className="text-sm text-green-400 font-medium">✓ Correct!</p>
                    : <p className="text-sm text-red-400 font-medium">✗ Incorrect</p>}
                  <p className="text-xs text-muted-foreground mt-1">{currentQ.explanation}</p>
                  <AIExplainButton question={currentQ.question} options={currentQ.options} correctIndex={currentQ.correct} explanation={currentQ.explanation} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Button className="w-full bg-primary h-11" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}