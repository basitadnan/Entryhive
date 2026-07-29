import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Menu, Flame, Clock, LogOut, Lightbulb, Users, Activity, Flag, CheckCheck } from 'lucide-react';
import { getQuestions, getSectionLabel } from '@/lib/questionBank';
import SessionFeedback from '@/components/practice/SessionFeedback';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

export default function FastPracticeSession() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const section = params.get('section') || 'english';
  const difficulty = params.get('difficulty') || 'all';
  const count = parseInt(params.get('count') || '10');
  const subTopic = params.get('subTopic') || null;

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]); 
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Starting initialization...');
  const [errorMsg, setErrorMsg] = useState(null);
  const [timer, setTimer] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());

  const savingRef = useRef(false);

  useEffect(() => {
    async function init() {
      try {
        setLoadingStep('Checking for saved session...');
        // Attempt to restore from sessionStorage
        const cached = sessionStorage.getItem('active_practice_session');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Only restore if the parameters match and the session wasn't finished
            if (parsed.section === section && parsed.difficulty === difficulty && !parsed.finished) {
              setSessionId(parsed.sessionId);
              setQuestions(parsed.questions);
              setCurrentIndex(parsed.currentIndex);
              setAnswers(parsed.answers);
              setTimer(parsed.timer);
              setMarkedQuestions(new Set(parsed.markedQuestions));
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse cached session', e);
          }
        }

        setLoadingStep('Fetching questions from questionBank...');
        let qs = await getQuestions(section, difficulty, count, [], subTopic);
        
        setLoadingStep(`Got ${qs?.length || 0} questions.`);
        if (!qs || !qs.length) {
          setLoadingStep('No questions found, finalizing...');
          setLoading(false);
          return;
        }
        
        setLoadingStep('Creating local session...');
        // Use a dummy session ID instead
        setSessionId(`local_session_${Date.now()}`);
        
        setLoadingStep('Updating state...');
        setQuestions(qs);
        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setErrorMsg(err.message || 'Unknown error occurred');
        setLoading(false);
      }
    }
    init();
  }, []);

  // Save current state to sessionStorage for persistence across reloads
  useEffect(() => {
    if (loading || !questions.length) return;
    
    if (finished) {
      sessionStorage.removeItem('active_practice_session');
      return;
    }

    const stateObj = {
      section,
      difficulty,
      sessionId,
      questions,
      currentIndex,
      answers,
      timer,
      markedQuestions: Array.from(markedQuestions),
      finished
    };
    sessionStorage.setItem('active_practice_session', JSON.stringify(stateObj));
  }, [sessionId, questions, currentIndex, answers, timer, markedQuestions, finished, section, difficulty, loading]);

  useEffect(() => {
    if (finished || loading || !questions.length) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [finished, loading, questions.length]);

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
  const progressPercent = questions.length > 0 ? ((answers.length) / questions.length) * 100 : 0;
  const currentAnswer = answers.find(a => a.questionId === currentQ?.id);

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h === '00' ? '' : h + ':'}${m}:${s}`;
  };

  const handleSelectOption = (index) => {
    if (currentAnswer) return; // Locked
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (currentAnswer) {
      // It's acting as "Next Question"
      handleNext();
      return;
    }
    
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === currentQ.correct;
    if (isCorrect) sounds.correct();
    else sounds.wrong();
    
    setAnswers(prev => [...prev, {
      questionId: currentQ.id,
      selected: selectedAnswer,
      correct: currentQ.correct,
      isCorrect,
    }]);
  };

  const handleNext = () => {
    sounds.click();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      sounds.vibrate(200);
      finishSession();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sounds.click();
      setCurrentIndex(prev => prev - 1);
      const prevAns = answers.find(a => a.questionId === questions[currentIndex - 1].id);
      setSelectedAnswer(prevAns ? prevAns.selected : null);
    }
  };

  const toggleMark = () => {
    setMarkedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const finishSession = async () => {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);

    if (sessionId) {
      await supabase.from('PracticeSession').update({
        answers_json: JSON.stringify(answers),
        correct_answers: correctCount,
        wrong_answers: questions.length - correctCount,
        score_percentage: scorePercent,
        completed: true,
      }).eq('id', sessionId);
    }

    const newCount = (user?.practice_count || 0) + 1;
    await base44.auth.updateMe({ practice_count: newCount });
    if (setUser) setUser(prev => ({ ...prev, practice_count: newCount }));

    setFinished(true);
    sessionStorage.removeItem('active_practice_session');
    sounds.complete();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground font-medium">Preparing questions...</p>
        <p className="mt-2 text-xs text-primary font-mono">{loadingStep}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 text-center text-red-500 bg-background flex flex-col items-center">
        <XCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load session</h2>
        <p className="text-sm">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="mt-4 btn-primary px-6 py-2 rounded-xl">Retry</button>
      </div>
    );
  }

  if (!questions.length) {
    return <div className="p-8 text-center text-muted-foreground bg-background">No questions found for this configuration.</div>;
  }

  if (finished) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background">
        <div className="bg-card rounded-3xl border border-border p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">{scorePercent >= 70 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}</div>
          <h2 className="font-display text-3xl font-bold mb-2 text-foreground">Session Complete!</h2>
          <p className="text-muted-foreground mb-8">{getSectionLabel(section)} • {difficulty} difficulty</p>
          
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="bg-primary/10 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-primary">{scorePercent}%</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Score</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-primary">{correctCount}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Correct</p>
            </div>
            <div className="bg-[hsl(var(--accent))]/10 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-[hsl(var(--accent))]">{questions.length - correctCount}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Wrong</p>
            </div>
          </div>
        </div>

        <WeakAreaAnalysis questions={questions} answers={answers} />
        <SessionFeedback answers={answers} questions={questions} section={section} scorePercent={scorePercent} />

        <div className="flex gap-4 pt-4">
          <button onClick={() => navigate('/fast/practice')} className="flex-1 bg-card border border-border text-foreground font-bold py-3.5 rounded-xl hover:bg-secondary transition">
            Back to Practice
          </button>
          <button onClick={() => navigate('/fast')} className="flex-1 btn-primary py-3.5 rounded-xl shadow-lg transition">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Active Session UI
  const isLocked = !!currentAnswer;
  const correctCount = answers.filter(a => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 100;
  
  return (
    <div className="flex flex-col flex-1 bg-background">
      
      {/* Session Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">FAST University - {getSectionLabel(section)}</h2>
            <p className="text-xs text-muted-foreground">FAST Practice Session • {subTopic || difficulty}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20">
              <Flame className="w-4 h-4 text-[hsl(var(--accent))]" />
              <span className="text-sm font-bold text-[hsl(var(--accent))]">{user?.streak || 0}x Streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-mono font-bold text-primary">{formatTimer(timer)}</span>
            </div>
            <button onClick={() => { sessionStorage.removeItem('active_practice_session'); navigate('/fast'); }} className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 px-3 sm:px-4 py-2 rounded-lg hover:opacity-80 transition">
              <LogOut className="w-4 h-4 hidden sm:block" /> End
            </button>
          </div>
        </div>
        <div className="h-1 w-full bg-secondary">
          <div className="h-1 bg-gradient-to-r from-primary to-primary-dark transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto">
        
        {/* Left Column (Question Area) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card rounded-3xl border border-border p-4 sm:p-6 md:p-10 shadow-sm">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${currentQ.difficulty === 'easy' ? 'bg-green-500/10 text-green-600 border-green-500/20' : currentQ.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/20'}`}>
                  {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)} Difficulty
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {currentQ.topic || 'General'}
                </span>
              </div>
              <span className="text-sm font-bold text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
            </div>

            <p className="font-display text-base sm:text-xl lg:text-2xl font-medium text-foreground mb-6 sm:mb-8 leading-relaxed break-words whitespace-pre-wrap">
              {currentQ.question}
            </p>

            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                let classes = "mcq-option rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 ";
                if (isLocked) {
                  classes += "locked ";
                  if (idx === currentQ.correct) classes += "correct ";
                  else if (isSelected && !currentAnswer.isCorrect) classes += "wrong ";
                } else {
                  if (isSelected) classes += "selected ";
                }

                return (
                  <div key={idx} className={classes} onClick={() => handleSelectOption(idx)}>
                    <div className="option-badge w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 border-border flex items-center justify-center font-bold text-muted-foreground text-base sm:text-lg flex-shrink-0 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-sm sm:text-base lg:text-lg transition-colors break-words ${isLocked && idx === currentQ.correct ? 'font-bold text-primary' : isSelected ? 'font-medium text-primary' : 'text-foreground'}`}>
                      {opt}
                    </span>
                    <CheckCircle2 className="status-icon w-6 h-6 ml-auto" />
                  </div>
                );
              })}
            </div>

            <div className={`explanation-panel ${isLocked ? 'show' : ''}`}>
              <div className="bg-secondary border border-border rounded-2xl p-6 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h4 className="font-display font-bold text-foreground">Explanation</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                  {currentQ.explanation}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <AIExplainButton question={currentQ.question} options={currentQ.options} correctIndex={currentQ.correct} explanation={currentQ.explanation} />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-card border border-border text-foreground px-4 sm:px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-secondary transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Previous</span>
            </button>

            <button 
              onClick={handleCheckAnswer}
              disabled={!isLocked && selectedAnswer === null}
              className={`flex-1 text-primary-foreground px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${!isLocked && selectedAnswer === null ? 'bg-secondary text-muted-foreground shadow-none cursor-not-allowed' : 'btn-primary pulse-glow'}`}
            >
              {isLocked ? (
                <>{currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'} <ChevronRight className="w-5 h-5" /></>
              ) : (
                <><CheckCheck className="w-5 h-5" /> Check Answer</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (Sidebar/Palette) */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Live Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-muted-foreground">Questions Done</span>
                  <span className="font-bold text-primary">{answers.length}/{questions.length}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-muted-foreground">Session Accuracy</span>
                  <span className="font-bold text-foreground">{accuracy}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-[var(--primary-dark)] rounded-full transition-all duration-500" style={{ width: `${accuracy}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{correctCount} correct, {answers.length - correctCount} wrong</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-foreground">Question Palette</h3>
              <button onClick={toggleMark} className={`text-xs hover:underline font-medium flex items-center gap-1 ${markedQuestions.has(currentIndex) ? 'text-[hsl(var(--accent))]' : 'text-muted-foreground'}`}>
                <Flag className="w-3 h-3" /> {markedQuestions.has(currentIndex) ? 'Marked' : 'Mark'}
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((q, i) => {
                const isAns = answers.some(a => a.questionId === q.id);
                const isMarked = markedQuestions.has(i);
                const isCurrent = i === currentIndex;
                
                let btnClass = "palette-btn ";
                if (isAns) btnClass += "answered ";
                else if (isMarked) btnClass += "marked ";
                else if (isCurrent) btnClass += "current ";

                return (
                  <button key={i} onClick={() => { setCurrentIndex(i); setSelectedAnswer(answers.find(a => a.questionId === q.id)?.selected ?? null); }} className={btnClass}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border pt-4 grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-primary"></div> Answered</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-card border border-border"></div> Unanswered</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-[hsl(var(--accent))]"></div> Marked</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded ring-2 ring-primary bg-card"></div> Current</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
