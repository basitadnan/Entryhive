import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Lock, CheckCircle2, XCircle, 
  ChevronRight, RotateCcw, BookOpen, 
  BrainCircuit, Calculator, Languages,
  Sparkles, Trophy, Target, Clock, Zap
} from 'lucide-react';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';
import { getQuestions } from '@/lib/questionBank';
import { sounds } from '@/lib/sounds';

const categoryIcons = {
  'English': <Languages className="w-8 h-8 text-blue-500" />,
  'Advance Maths': <Calculator className="w-8 h-8 text-rose-500" />,
  'Basic Maths': <Calculator className="w-8 h-8 text-emerald-500" />,
  'IQ': <BrainCircuit className="w-8 h-8 text-purple-500" />,
};

const sectionColors = {
  'English': 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-500 hover:border-blue-500/50',
  'Advance Maths': 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-500 hover:border-rose-500/50',
  'Basic Maths': 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-500 hover:border-emerald-500/50',
  'IQ': 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-500 hover:border-purple-500/50',
};

function PaperSession({ paper, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = paper.questions[currentIndex];
  const progress = ((currentIndex + (showResult ? 1 : 0)) / paper.questions.length) * 100;

  const handleSelect = (i) => {
    if (showResult) return;
    sounds.select();
    setSelectedAnswer(i);
    setShowResult(true);
    const isCorrect = i === q.correct_answer_index;
    if (isCorrect) sounds.correct();
    else sounds.wrong();
    setAnswers(prev => [...prev, { selected: i, correct: q.correct_answer_index, isCorrect }]);
  };

  const handleNext = () => {
    sounds.click();
    if (currentIndex < paper.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      sounds.success();
      setFinished(true);
    }
  };

  if (finished) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / paper.questions.length) * 100);
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-3xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-3xl p-10 text-center shadow-lg shadow-primary/10 border-2 border-primary/20 bg-card" style={{ background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary)/0.05) 100%)' }}>
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Trophy className="w-32 h-32 rotate-12" />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.1 }}
            className="text-7xl mb-6 inline-block filter drop-shadow-md"
          >
            {score >= 80 ? 'ðŸ‘‘' : score >= 60 ? 'ðŸ†' : 'ðŸ”¥'}
          </motion.div>
          <h2 className="font-display text-4xl font-black mb-3 text-foreground">Session Complete!</h2>
          <p className="text-muted-foreground font-medium mb-8 bg-secondary inline-block px-4 py-1.5 rounded-full text-sm border border-border">{paper.title}</p>
          
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-5 border border-border">
              <p className="font-display text-4xl font-black text-primary">{score}%</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Accuracy</p>
            </div>
            <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-5 border border-border">
              <p className="font-display text-4xl font-black text-emerald-500">{correctCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Correct</p>
            </div>
            <div className="bg-secondary/80 backdrop-blur-md rounded-2xl p-5 border border-border">
              <p className="font-display text-4xl font-black text-rose-500">{paper.questions.length - correctCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Missed</p>
            </div>
          </div>
        </div>

        <WeakAreaAnalysis questions={paper.questions} answers={paper.questions.map((q, i) => ({ selected: answers[i]?.selected, correct: q.correct_answer_index, isCorrect: answers[i]?.isCorrect }))} />

        <div className="space-y-6">
          <h3 className="font-display text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            Detailed Review
          </h3>
          <div className="grid gap-6">
            {paper.questions.map((q, i) => {
              const ans = answers[i];
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={q.id || i}
                >
                  <div className="p-6 bg-card rounded-3xl border-2 border-border shadow-sm hover:border-primary/30 transition-all group">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${ans?.isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                        {ans?.isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest ${sectionColors[q.section] || 'bg-secondary'}`}>
                            {q.section}
                          </span>
                        </div>
                        <p className="text-base font-bold text-foreground leading-relaxed">{q.question_text}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-12">
                      {q.options.map((opt, j) => (
                        <div 
                          key={j} 
                          className={`text-sm px-4 py-3 rounded-2xl border-2 transition-colors flex items-center ${
                            j === q.correct_answer_index 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' 
                              : j === ans?.selected && !ans?.isCorrect 
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-medium' 
                                : 'bg-secondary/50 border-border text-muted-foreground font-medium'
                          }`}
                        >
                          <span className={`w-6 h-6 flex items-center justify-center rounded-md mr-3 text-xs font-bold ${
                            j === q.correct_answer_index ? 'bg-emerald-500/20' :
                            j === ans?.selected && !ans?.isCorrect ? 'bg-rose-500/20' : 'bg-secondary border border-border'
                          }`}>{String.fromCharCode(65 + j)}</span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="mt-6 ml-12 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                        <p className="text-sm text-foreground leading-relaxed font-medium">
                          <span className="font-bold text-primary mr-2 flex items-center gap-1.5 mb-1"><Sparkles className="w-4 h-4"/> Explanation:</span>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 ml-12">
                      <AIExplainButton 
                        question={q.question_text} 
                        options={q.options} 
                        correctIndex={q.correct_answer_index} 
                        explanation={q.explanation} 
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 sticky bottom-4 z-10 pt-4">
          <button className="flex-1 py-4 rounded-2xl bg-secondary/80 backdrop-blur-xl border-2 border-border font-bold hover:bg-secondary transition-colors shadow-lg flex items-center justify-center gap-2" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" /> Exit to Library
          </button>
          <button className="flex-1 py-4 rounded-2xl btn-primary shadow-xl font-bold flex items-center justify-center gap-2 text-lg" onClick={() => { sounds.click(); setFinished(false); setCurrentIndex(0); setAnswers([]); setSelectedAnswer(null); setShowResult(false); }}>
            <RotateCcw className="w-5 h-5" /> Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-xl border border-border">
          <div className="text-right flex items-center gap-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Question</p>
            <p className="text-lg font-black text-primary">{currentIndex + 1} <span className="text-muted-foreground font-medium text-sm">/ {paper.questions.length}</span></p>
          </div>
        </div>
      </div>

      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary rounded-full transition-all duration-300"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6 sm:p-10 bg-card rounded-3xl border-2 border-border shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${sectionColors[q.section] || 'bg-secondary'}`}>
                {q.section}
              </span>
              {q.difficulty && (
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                  q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                  q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                  {q.difficulty}
                </span>
              )}
            </div>

            {q.topic && <p className="text-xs font-bold text-primary/80 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {q.topic}</p>}
            <h3 className="font-display text-2xl font-bold leading-relaxed mb-10 text-foreground whitespace-pre-wrap">{q.question_text}</h3>

            <div className="space-y-4">
              {q.options.map((opt, i) => {
                let status = 'idle';
                if (showResult) {
                  if (i === q.correct_answer_index) status = 'correct';
                  else if (i === selectedAnswer) status = 'wrong';
                  else status = 'dimmed';
                } else if (selectedAnswer === i) {
                  status = 'selected';
                }

                return (
                  <motion.button
                    whileHover={{ scale: status === 'idle' ? 1.01 : 1 }}
                    whileTap={{ scale: status === 'idle' ? 0.99 : 1 }}
                    key={i}
                    disabled={showResult}
                    className={`w-full group text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                      status === 'idle' ? 'border-border bg-card hover:border-primary/40 hover:shadow-md' :
                      status === 'selected' ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' :
                      status === 'correct' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      status === 'wrong' ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                      'border-border/50 bg-secondary/30 opacity-60 grayscale'
                    }`}
                    onClick={() => handleSelect(i)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-colors shrink-0 ${
                      status === 'correct' ? 'bg-emerald-500 text-white' :
                      status === 'wrong' ? 'bg-rose-500 text-white' :
                      status === 'selected' ? 'bg-primary text-white' :
                      'bg-secondary border border-border group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`flex-1 font-medium text-lg ${status === 'idle' ? 'text-foreground' : ''}`}>{opt}</span>
                    {status === 'correct' && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                    {status === 'wrong' && <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 p-6 rounded-2xl border-2 ${selectedAnswer === q.correct_answer_index ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {selectedAnswer === q.correct_answer_index ? (
                    <Trophy className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Target className="w-5 h-5 text-rose-500" />
                  )}
                  <p className={`text-base font-black uppercase tracking-widest ${selectedAnswer === q.correct_answer_index ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {selectedAnswer === q.correct_answer_index ? 'Genius!' : 'Good effort!'}
                  </p>
                </div>
                {q.explanation && <p className="text-sm text-foreground font-medium leading-relaxed mb-4">{q.explanation}</p>}
                <AIExplainButton question={q.question_text} options={q.options} correctIndex={q.correct_answer_index} explanation={q.explanation} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="h-20 pt-4">
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button className="btn-primary w-full h-16 text-xl font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 group" onClick={handleNext}>
              {currentIndex < paper.questions.length - 1 ? 'Next Challenge' : 'See Results'}
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function FastPastPapers() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [activePaper, setActivePaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllFastPapers() {
      try {
        setLoading(true);
        const eng = await getQuestions('fast_english', 'all', 150);
        const advMath = await getQuestions('fast_advance_maths', 'all', 200);
        const basicMath = await getQuestions('fast_basic_maths', 'all', 200);
        const iq = await getQuestions('fast_iq', 'all', 150);

        const formattedEng = eng.map(q => ({...q, section: 'English'}));
        const formattedAdvMath = advMath.map(q => ({...q, section: 'Advance Maths'}));
        const formattedBasicMath = basicMath.map(q => ({...q, section: 'Basic Maths'}));
        const formattedIq = iq.map(q => ({...q, section: 'IQ'}));

        setQuestions([...formattedEng, ...formattedAdvMath, ...formattedBasicMath, ...formattedIq]);
      } catch (error) {
        console.error('Failed to load fast past papers:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllFastPapers();
  }, []);

  if (!user?.is_premium) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
        <button onClick={() => navigate('/fast')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to FAST Hub
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-12 sm:p-20 text-center space-y-8 bg-card rounded-[40px] border-2 border-border shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center rotate-6 shadow-lg shadow-primary/20 border-2 border-primary/20">
              <Lock className="w-12 h-12 text-primary -rotate-6" />
            </div>
            <div className="absolute -top-3 -right-3 bg-primary text-white p-2 rounded-xl shadow-lg animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="font-display text-4xl font-black text-foreground">Premium Archive</h2>
            <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
              Unlock over 1,400+ real FAST University past paper questions categorized by subject.
            </p>
          </div>
          <button className="btn-primary h-14 px-10 text-lg font-bold rounded-2xl shadow-2xl relative z-10" onClick={() => navigate('/premium')}>
            Upgrade to Premium
          </button>
        </motion.div>
      </div>
    );
  }

  if (activePaper) {
    return (
      <div className="p-4 sm:p-6 pb-20">
        <PaperSession paper={activePaper} onBack={() => setActivePaper(null)} />
      </div>
    );
  }

  const grouped = questions.reduce((acc, q) => {
    const sec = q.section || 'General';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(q);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-5xl mx-auto space-y-10 pb-32"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-black text-foreground">FAST Past Papers</h1>
            <div className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium</span>
            </div>
          </div>
          <p className="text-muted-foreground font-medium text-lg">Master the FAST Entry Test by practicing with real previous exam questions.</p>
        </div>
        <button onClick={() => navigate('/fast')} className="py-2.5 px-5 bg-card border-2 border-border text-foreground hover:bg-secondary rounded-xl font-bold transition-colors shadow-sm self-start sm:self-center flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> FAST Hub
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl p-6 border-2 border-border shadow-sm flex items-center gap-5 hover:border-primary/40 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-display text-3xl font-black text-foreground mb-1">{questions.length}</p>
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Total Questions</p>
          </div>
        </div>
        <div className="bg-card rounded-3xl p-6 border-2 border-border shadow-sm flex items-center gap-5 hover:border-emerald-500/40 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Zap className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="font-display text-3xl font-black text-foreground mb-1">{categories.length}</p>
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Subject Tracks</p>
          </div>
        </div>
        <div className="bg-card rounded-3xl p-6 border-2 border-border shadow-sm flex items-center gap-5 hover:border-amber-500/40 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="font-display text-3xl font-black text-foreground mb-1">2026</p>
            <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Latest Extraction</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Sourcing archive...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-16 text-center border-4 border-dashed border-border bg-card/50 rounded-[40px]">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h3 className="font-display text-2xl font-bold mb-3 text-foreground">The Archive is Empty</h3>
          <p className="text-base text-muted-foreground max-w-sm mx-auto mb-8 font-medium">No FAST past paper questions have been added to the database yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={cat}
            >
              <div 
                className={`group p-8 cursor-pointer bg-gradient-to-br bg-card border-2 transition-all duration-300 relative overflow-hidden rounded-3xl shadow-sm ${sectionColors[cat] || 'border-border hover:border-primary/40'}`}
                onClick={() => setActivePaper({ title: `FAST ${cat} - Past Papers`, questions: grouped[cat] })}
              >
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                  {categoryIcons[cat] || <BookOpen className="w-48 h-48" />}
                </div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center border border-border group-hover:scale-110 transition-transform duration-500 shadow-sm">
                    {categoryIcons[cat] || <BookOpen className="w-8 h-8" />}
                  </div>
                  <div className="bg-background px-4 py-1.5 rounded-xl border border-border shadow-sm">
                    <p className="text-xs font-black tracking-wider text-foreground">{grouped[cat].length} Qs</p>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <h3 className="font-display font-black text-3xl tracking-tight group-hover:text-primary transition-colors text-foreground">{cat}</h3>
                  <p className="text-sm font-medium text-muted-foreground">FAST previous exam bank</p>
                </div>

                <div className="mt-8 flex items-center text-primary font-bold text-base relative z-10 bg-primary/5 w-fit px-4 py-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                  Start Practice
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-card p-8 sm:p-10 rounded-[40px] border-2 border-primary/20 flex flex-col sm:flex-row items-center gap-8 justify-between shadow-lg shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="space-y-3 text-center sm:text-left relative z-10">
          <h3 className="font-display text-2xl font-bold text-foreground">Can't find a subject?</h3>
          <p className="text-base text-muted-foreground font-medium max-w-md">We are constantly extracting more PDFs to add to the database.</p>
        </div>
        <button className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold shadow-xl shrink-0 relative z-10" onClick={() => navigate('/feedback')}>
          Request Subject
        </button>
      </div>
    </motion.div>
  );
}
