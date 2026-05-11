import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle } from 'lucide-react';
import { getMockTestQuestions, getSectionLabel } from '@/lib/questionBank';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';
import { sounds } from '@/lib/sounds';

export default function MockTestSession() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadQuestions() {
      // 1. Get initial set from local bank
      const sections = getMockTestQuestions(user?.nat_group);
      
      // 2. Fetch additional questions from Supabase for each section
      try {
        const { data: dbQs, error } = await supabase
          .from('questions')
          .select('*')
          .limit(50); // Get a good sample

        if (!error && dbQs && dbQs.length > 0) {
          // Add them to the appropriate sections
          dbQs.forEach(q => {
            const formatted = {
              id: q.id,
              question: q.question_text,
              options: q.options,
              correct: q.correct_answer_index,
              explanation: q.explanation,
              difficulty: q.difficulty,
              section: q.section.charAt(0).toUpperCase() + q.section.slice(1)
            };

            // Mix them into the pools (limit pools back to standard NAT sizes later)
            if (q.section === 'english') sections.english.push(formatted);
            else if (q.section === 'analytical') sections.analytical.push(formatted);
            else if (q.section === 'quantitative') sections.quantitative.push(formatted);
            else sections.subject.push(formatted);
          });
        }
      } catch (e) {
        console.error('Supabase fetch failed:', e);
      }

      // 3. Flatten and limit to standard NAT counts (shuffled)
      const all = [
        ...sections.english.sort(() => Math.random() - 0.5).slice(0, 20),
        ...sections.analytical.sort(() => Math.random() - 0.5).slice(0, 20),
        ...sections.quantitative.sort(() => Math.random() - 0.5).slice(0, 20),
        ...sections.subject.sort(() => Math.random() - 0.5).slice(0, 30)
      ];
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
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !finished && allQuestions.length > 0) {
      handleFinish();
    }
  }, [timeLeft]);

  const formatTime = (s) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const currentQ = allQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optIdx) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleFinish = async () => {
    sounds.vibrate(200); // Feel the submission
    clearInterval(timerRef.current);
    
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const sectionScores = {};

    allQuestions.forEach((q, i) => {
      const sec = q.section;
      if (!sectionScores[sec]) sectionScores[sec] = { total: 0, correct: 0 };
      sectionScores[sec].total++;
      
      if (answers[i] !== undefined) {
        if (answers[i] === q.correct) {
          correct++;
          sectionScores[sec].correct++;
        } else {
          wrong++;
        }
      } else {
        unanswered++;
      }
    });

    const scorePercent = Math.round((correct / allQuestions.length) * 100);
    const timeTaken = 120 * 60 - timeLeft;

    const { error } = await supabase.from('MockTestResult').insert({
      user_email: user.email,
      nat_group: user.nat_group,
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
    }

    const newCount = (user.mock_count || 0) + 1;
    await base44.auth.updateMe({ mock_count: newCount });
    setUser(prev => ({ ...prev, mock_count: newCount }));

    setFinished(true);
  };

  if (allQuestions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Loading test...</div>;
  }

  if (finished && showReview) {
    return (
      <div className="p-4 space-y-3">
        <Button variant="outline" onClick={() => setShowReview(false)} className="mb-3">← Back to Results</Button>
        <h2 className="font-bold text-lg">Review All Answers</h2>
        {allQuestions.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.correct;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{i + 1}.</span>
                {userAns !== undefined ? (isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />) : <span className="text-xs text-amber-400">⊘</span>}
                <p className="text-sm">{q.question}</p>
              </div>
              <div className="space-y-1 ml-6">
                {q.options.map((opt, j) => (
                  <p key={j} className={`text-xs px-2 py-1 rounded ${j === q.correct ? 'bg-green-500/10 text-green-400' : j === userAns && !isCorrect ? 'bg-red-500/10 text-red-400' : 'text-muted-foreground'}`}>
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
        <Button className="w-full" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (finished) {
    const correct = allQuestions.filter((q, i) => answers[i] === q.correct).length;
    const wrong = allQuestions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correct).length;
    const unanswered = allQuestions.length - Object.keys(answers).length;
    const scorePercent = Math.round((correct / allQuestions.length) * 100);

    return (
      <div className="p-4 space-y-5">
        <Card className="p-6 text-center">
          <div className="text-4xl mb-3">{scorePercent >= 70 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold">Mock Test Complete!</h2>
          <p className="text-5xl font-bold text-primary mt-4">{scorePercent}%</p>
          <p className="text-muted-foreground mt-1">Overall Score</p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div><p className="text-xl font-bold text-green-400">{correct}</p><p className="text-xs text-muted-foreground">Correct</p></div>
            <div><p className="text-xl font-bold text-red-400">{wrong}</p><p className="text-xs text-muted-foreground">Wrong</p></div>
            <div><p className="text-xl font-bold text-amber-400">{unanswered}</p><p className="text-xs text-muted-foreground">Skipped</p></div>
          </div>
        </Card>

        <WeakAreaAnalysis questions={allQuestions} answers={allQuestions.map((q, i) => ({ selected: answers[i], correct: q.correct, isCorrect: answers[i] === q.correct }))} />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowReview(true)}>Review Answers</Button>
          <Button className="flex-1 bg-primary" onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Timer bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{currentQ?.section}</span>
        <div className={`flex items-center gap-1 text-sm font-mono font-semibold ${timeLeft < 300 ? 'text-red-400' : 'text-primary'}`}>
          <Clock className="w-3 h-3" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <Progress value={(answeredCount / allQuestions.length) * 100} className="h-1.5" />
      <p className="text-xs text-muted-foreground text-center">{answeredCount}/{allQuestions.length} answered</p>

      {/* Question */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-muted-foreground">Q{currentIndex + 1} of {allQuestions.length}</p>
          {currentQ?.topic && (
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
              {currentQ.topic}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-base leading-relaxed mb-4">{currentQ?.question}</h3>
        <div className="space-y-2">
          {currentQ?.options.map((opt, i) => (
            <button
              key={i}
              className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${answers[currentIndex] === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              onClick={() => handleSelect(i)}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        {/* Question dots */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1 justify-center flex-wrap">
            {allQuestions.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((_, idx) => {
              const realIdx = Math.max(0, currentIndex - 4) + idx;
              return (
                <button
                  key={realIdx}
                  onClick={() => setCurrentIndex(realIdx)}
                  className={`w-7 h-7 rounded text-xs font-medium ${realIdx === currentIndex ? 'bg-primary text-white' : answers[realIdx] !== undefined ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}
                >
                  {realIdx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <Button variant="outline" size="sm" disabled={currentIndex === allQuestions.length - 1} onClick={() => setCurrentIndex(prev => prev + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button variant="destructive" className="w-full" onClick={handleFinish}>
        <Flag className="w-4 h-4 mr-2" /> Submit Test
      </Button>
    </div>
  );
}