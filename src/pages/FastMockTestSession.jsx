import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/lib/dbClient';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Flag, LayoutGrid, Timer, LogOut, FileText, AlertTriangle } from 'lucide-react';
import { getMockTestQuestions, getSectionLabel } from '@/lib/questionBank';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';
import { sounds } from '@/lib/sounds';

export default function FastMockTestSession() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const group = searchParams.get('group') || user?.nat_group;
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadQuestions() {
      const cached = sessionStorage.getItem('fast_active_mock_session');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!parsed.finished && parsed.group === group) {
            setAllQuestions(parsed.allQuestions);
            setCurrentIndex(parsed.currentIndex);
            setCurrentSectionIndex(parsed.currentSectionIndex);
            setAnswers(parsed.answers);
            setTimeLeft(parsed.timeLeft);
            setMarkedQuestions(new Set(parsed.markedQuestions));
            return;
          }
        } catch(e) {
          console.error('Failed to parse cached session', e);
        }
      }

      const all = await getMockTestQuestions(group);
      setAllQuestions(all);
    }
    loadQuestions();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [group]);

  // Save current state to sessionStorage for persistence across reloads
  // Only save on meaningful changes (not every timer tick)
  useEffect(() => {
    if (!allQuestions.length) return;
    
    if (finished) {
      sessionStorage.removeItem('fast_active_mock_session');
      return;
    }

    const stateObj = {
      group,
      allQuestions,
      currentIndex,
      currentSectionIndex,
      answers,
      timeLeft,
      markedQuestions: Array.from(markedQuestions),
      finished
    };
    sessionStorage.setItem('fast_active_mock_session', JSON.stringify(stateObj));
  }, [group, allQuestions, currentIndex, currentSectionIndex, answers, markedQuestions, finished]);

  // Save timeLeft separately every 10 seconds to avoid excessive writes
  useEffect(() => {
    if (!allQuestions.length || finished) return;
    if (timeLeft % 10 !== 0) return;
    const cached = sessionStorage.getItem('fast_active_mock_session');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.timeLeft = timeLeft;
        sessionStorage.setItem('fast_active_mock_session', JSON.stringify(parsed));
      } catch(e) {}
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !finished && allQuestions.length > 0) {
      handleFinish();
    }
  }, [timeLeft]);

  const sections = useMemo(() => {
    if (!allQuestions.length) return [];
    const secs = [];
    let currentSec = allQuestions[0].section;
    let startIdx = 0;
    for (let i = 1; i < allQuestions.length; i++) {
      if (allQuestions[i].section !== currentSec) {
        secs.push({ section: currentSec, start: startIdx, end: i - 1 });
        currentSec = allQuestions[i].section;
        startIdx = i;
      }
    }
    secs.push({ section: currentSec, start: startIdx, end: allQuestions.length - 1 });
    return secs;
  }, [allQuestions]);

  const formatTime = (s) => {
    const h = Math.floor(s/3600).toString().padStart(2,'0');
    const m = Math.floor((s%3600)/60).toString().padStart(2,'0');
    const sec = (s%60).toString().padStart(2,'0');
    return `${h === '00' ? '' : h + ':'}${m}:${sec}`;
  };

  const currentQ = allQuestions[currentIndex];
  const activeSection = sections[currentSectionIndex];
  
  const sectionAnsweredCount = activeSection ? Object.keys(answers).filter(i => Number(i) >= activeSection.start && Number(i) <= activeSection.end).length : 0;
  const sectionTotalCount = activeSection ? (activeSection.end - activeSection.start + 1) : 0;
  const totalAnsweredCount = Object.keys(answers).length;

  const handleSelectOption = (optIdx) => {
    // FAST rules: Cannot change answer once selected
    if (answers[currentIndex] !== undefined) return;
    
    setAnswers(prev => ({ ...prev, [currentIndex]: optIdx }));
    sounds.click();
  };

  const handleNext = () => {
    if (currentIndex < activeSection.end) {
      sounds.click();
      setCurrentIndex(prev => prev + 1);
    } else {
      if (currentSectionIndex < sections.length - 1) {
        if (window.confirm("You are about to finish this section. You CANNOT return to this section once you proceed. Are you sure?")) {
          sounds.click();
          setCurrentSectionIndex(prev => prev + 1);
          setCurrentIndex(sections[currentSectionIndex + 1].start);
        }
      } else {
        if (window.confirm("Are you sure you want to finish the test?")) {
          handleFinish();
        }
      }
    }
  };

  const handlePrev = () => {
    // FAST rules: Can only go back within the current section
    if (currentIndex > activeSection.start) {
      sounds.click();
      setCurrentIndex(prev => prev - 1);
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

  const handleFinish = async () => {
    sounds.vibrate(200);
    clearInterval(timerRef.current);
    
    // Immediately transition to finished state so UI never gets stuck
    setFinished(true);
    setShowConfirm(false);
    sounds.complete();
    
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const sectionScores = {};

    allQuestions.forEach((q, i) => {
      const sec = q.section;
      if (!sectionScores[sec]) sectionScores[sec] = { total: 0, correct: 0, wrong: 0 };
      sectionScores[sec].total++;
      
      if (answers[i] !== undefined) {
        if (answers[i] === q.correct) {
          correct++;
          sectionScores[sec].correct++;
        } else {
          wrong++;
          sectionScores[sec].wrong++;
        }
      } else {
        unanswered++;
      }
    });

    // FAST Rules: Negative marking 0.25 for every wrong answer
    const penalty = wrong * 0.25;
    const finalScore = Math.max(0, correct - penalty);
    const scorePercent = Math.round((finalScore / allQuestions.length) * 100);
    const timeTaken = 120 * 60 - timeLeft;

    // Save to DB in background — don't block the UI
    try {
      const { error } = await supabase.from('MockTestResult').insert({
        user_email: user?.email,
        nat_group: user?.nat_group,
        total_questions: allQuestions.length,
        correct_answers: correct,
        wrong_answers: wrong,
        unanswered,
        score_percentage: scorePercent,
        section_scores: sectionScores,
        time_taken_seconds: timeTaken,
        completed: true,
      });
      
      if (error) {
        console.error('Failed to save mock test result:', error);
      } else {
        const newCount = (user?.mock_count || 0) + 1;
        try {
          await base44.auth.updateMe({ mock_count: newCount });
        } catch(e2) { console.error('base44 updateMe error:', e2); }
        if (setUser) setUser(prev => ({ ...prev, mock_count: newCount }));
      }
    } catch (e) {
      console.error('Submission error:', e);
    }
  };

  if (allQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground font-medium">Generating Mock Test...</p>
      </div>
    );
  }

  if (finished && showReview) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 bg-background">
        <button onClick={() => setShowReview(false)} className="bg-card border border-border text-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-secondary transition shadow-sm mb-6">
          <ArrowLeft className="w-5 h-5" /> Back to Results
        </button>
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Review All Answers</h2>
        
        {allQuestions.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.correct;
          return (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-sm mb-4">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-sm font-bold text-muted-foreground mt-0.5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-foreground break-words whitespace-pre-wrap">{q.question}</p>
                </div>
                {userAns !== undefined ? (isCorrect ? <CheckCircle2 className="w-6 h-6 text-primary shrink-0" /> : <XCircle className="w-6 h-6 text-[hsl(var(--accent))] shrink-0" />) : <span className="text-sm font-bold text-amber-500 shrink-0">Skipped</span>}
              </div>
              
              <div className="space-y-2 ml-0 sm:ml-7">
                {q.options.map((opt, j) => (
                  <div key={j} className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-sm sm:text-base break-words ${j === q.correct ? 'bg-primary/10 border-primary/20 text-primary font-medium' : j === userAns && !isCorrect ? 'bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]' : 'bg-card border-border text-foreground'}`}>
                    {String.fromCharCode(65 + j)}. {opt}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 sm:mt-6 ml-0 sm:ml-7 bg-secondary border border-border rounded-xl p-3 sm:p-4">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3"><strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}</p>
                <AIExplainButton question={q.question} options={q.options} correctIndex={q.correct} explanation={q.explanation} />
              </div>
            </div>
          );
        })}
          <button onClick={() => navigate('/fast')} className="btn-primary w-full py-4 rounded-xl shadow-lg hover:scale-[1.02] transition">
            Go back to FAST Hub
          </button>
      </div>
    );
  }

  if (finished) {
    const correct = allQuestions.filter((q, i) => answers[i] === q.correct).length;
    const wrong = allQuestions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
    const unanswered = allQuestions.length - Object.keys(answers).length;
    const penalty = wrong * 0.25;
    const finalScore = Math.max(0, correct - penalty);
    const scorePercent = Math.round((finalScore / allQuestions.length) * 100);

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background">
        <div className="bg-card rounded-3xl border border-border p-8 text-center shadow-sm relative overflow-hidden">
          <div className="text-5xl mb-4">{scorePercent >= 70 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}</div>
          <h2 className="font-display text-3xl font-bold mb-2 text-foreground">Mock Test Complete!</h2>
          <p className="text-muted-foreground mb-8">FAST Pattern • {allQuestions.length} Questions</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <div className="bg-secondary rounded-2xl p-4 md:col-span-1 col-span-2">
              <p className="font-display text-3xl font-bold text-primary">{scorePercent}%</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Final Score</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-primary">+{correct}</p>
              <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mt-1">Correct</p>
            </div>
            <div className="bg-[hsl(var(--accent))]/10 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-[hsl(var(--accent))]">{wrong}</p>
              <p className="text-[10px] font-bold text-[hsl(var(--accent))]/70 uppercase tracking-wider mt-1">Wrong</p>
            </div>
            <div className="bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-[hsl(var(--accent))]">-{penalty}</p>
              <p className="text-[10px] font-bold text-[hsl(var(--accent))]/70 uppercase tracking-wider mt-1">Penalty</p>
            </div>
            <div className="bg-amber-500/10 rounded-2xl p-4">
              <p className="font-display text-3xl font-bold text-amber-500">{unanswered}</p>
              <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider mt-1">Skipped</p>
            </div>
          </div>
          
          <div className="mt-6 text-sm font-medium text-muted-foreground bg-secondary/50 inline-block px-4 py-2 rounded-lg">
            Final Mark Calculation: {correct} - ({wrong} × 0.25) = <strong>{finalScore}</strong>
          </div>
        </div>

        <WeakAreaAnalysis questions={allQuestions} answers={allQuestions.map((q, i) => ({ selected: answers[i], correct: q.correct, isCorrect: answers[i] === q.correct }))} />

        <div className="flex gap-4 pt-4">
          <button onClick={() => setShowReview(true)} className="flex-1 bg-card border border-border text-foreground font-bold py-3.5 rounded-xl hover:bg-secondary transition">
            Review Answers
          </button>
          <button onClick={() => navigate('/fast')} className="flex-1 btn-primary py-3.5 rounded-xl transition shadow-lg">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  // Active Session UI
  const progressPercent = (totalAnsweredCount / allQuestions.length) * 100;

  return (
    <div className="flex flex-col flex-1 bg-background relative">
      
      {/* End Test Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-xl font-bold mb-2">End Test?</h3>
            <p className="text-muted-foreground mb-6">You have answered {totalAnsweredCount} out of {allQuestions.length} questions. Are you sure you want to submit?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 rounded-xl font-bold bg-secondary hover:bg-secondary/80 transition">Cancel</button>
              <button onClick={handleFinish} className="flex-1 px-4 py-2 rounded-xl font-bold bg-[hsl(var(--accent))] text-white hover:opacity-90 transition">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Session Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 hidden sm:flex">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">FAST NU Mock Exam</h2>
              <p className="text-xs text-muted-foreground">Strict Mode • Negative Marking Active</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border ${timeLeft < 300 ? 'bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] animate-pulse' : 'bg-primary/10 border-primary/20 text-primary'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/20 bg-[hsl(var(--accent))]/10 px-3 sm:px-4 py-2 rounded-lg hover:opacity-80 transition">
              <LogOut className="w-4 h-4 hidden sm:block" /> End
            </button>
          </div>
        </div>
        <div className="h-1 w-full bg-secondary">
          <div className="h-1 bg-gradient-to-r from-primary to-[var(--primary-dark)] transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid lg:grid-cols-3 gap-6 max-w-7xl w-full mx-auto">
        
        {/* Left Column (Question Area) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card rounded-3xl border border-border p-4 sm:p-6 md:p-10 shadow-sm relative">
            
            {/* Warning banners */}
            <div className="absolute top-0 left-0 w-full flex flex-col">
              <div className="w-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] text-[10px] font-bold uppercase tracking-wider py-1 text-center">
                Cannot change answer once selected
              </div>
              {activeSection?.section === 'fast_iq' && (
                <div className="w-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider py-1 text-center">
                  Note: Image-based questions excluded temporarily due to time constraints
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border mt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                  {getSectionLabel(currentQ?.section)}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-secondary text-muted-foreground border-border">
                  Section {currentSectionIndex + 1} of {sections.length}
                </span>
              </div>
              <span className="text-sm font-bold text-muted-foreground">
                Question {currentIndex - activeSection.start + 1} of {sectionTotalCount}
              </span>
            </div>

            <p className="font-display text-base sm:text-xl lg:text-2xl font-medium text-foreground mb-6 sm:mb-8 leading-relaxed break-words whitespace-pre-wrap">
              {currentQ?.question}
            </p>

            <div className="space-y-4">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = answers[currentIndex] === idx;
                const hasAnswered = answers[currentIndex] !== undefined;
                
                let classes = "mcq-option rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-200 ";
                
                if (isSelected) {
                  classes += "bg-primary/10 border-primary/40 shadow-sm ring-1 ring-primary/20 ";
                } else if (hasAnswered) {
                  classes += "opacity-50 cursor-not-allowed ";
                } else {
                  classes += "hover:bg-secondary cursor-pointer border border-border ";
                }

                return (
                  <div key={idx} className={classes} onClick={() => handleSelectOption(idx)}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 transition-colors ${isSelected ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-sm sm:text-base lg:text-lg transition-colors break-words ${isSelected ? 'font-medium text-primary' : 'text-foreground'}`}>
                      {opt}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === activeSection.start}
              className="bg-card border border-border text-foreground px-4 sm:px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-secondary transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Previous</span>
            </button>

            <button 
              onClick={handleNext}
              className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${currentIndex === activeSection.end ? 'bg-[hsl(var(--accent))] text-white hover:opacity-90 shadow-[hsl(var(--accent))]/20' : 'btn-primary shadow-primary/20'}`}
            >
              {currentIndex === activeSection.end ? (
                currentSectionIndex === sections.length - 1 ? 'Finish Exam' : 'Finish Section & Proceed'
              ) : 'Next Question'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column (Sidebar/Palette) */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" /> Section Status
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary p-3 rounded-xl border border-border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Answered</p>
                  <p className="text-xl font-bold text-foreground">{sectionAnsweredCount}</p>
                </div>
                <div className="bg-secondary p-3 rounded-xl border border-border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Remaining</p>
                  <p className="text-xl font-bold text-foreground">{sectionTotalCount - sectionAnsweredCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-foreground">Section Palette</h3>
              <button onClick={toggleMark} className={`text-xs hover:underline font-medium flex items-center gap-1 ${markedQuestions.has(currentIndex) ? 'text-amber-500' : 'text-muted-foreground'}`}>
                <Flag className="w-3 h-3" /> {markedQuestions.has(currentIndex) ? 'Marked' : 'Mark'}
              </button>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {/* Only render buttons for the current active section */}
              {Array.from({ length: sectionTotalCount }).map((_, localIdx) => {
                const globalIdx = activeSection.start + localIdx;
                const isAns = answers[globalIdx] !== undefined;
                const isMarked = markedQuestions.has(globalIdx);
                const isCurrent = globalIdx === currentIndex;
                
                let btnClass = "palette-btn ";
                if (isAns) btnClass += "answered ";
                else if (isMarked) btnClass += "marked ";
                else if (isCurrent) btnClass += "current ";

                return (
                  <button key={globalIdx} onClick={() => setCurrentIndex(globalIdx)} className={btnClass}>
                    {localIdx + 1}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border pt-4 grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-primary"></div> Answered</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-card border border-border"></div> Unanswered</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded bg-amber-500"></div> Marked</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded ring-2 ring-primary bg-card"></div> Current</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
