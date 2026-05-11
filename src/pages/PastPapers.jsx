import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Lock, CheckCircle2, XCircle, 
  ChevronRight, RotateCcw, BookOpen, 
  BrainCircuit, Calculator, Microscope, Monitor, Languages,
  Sparkles, Trophy, Target, Clock, Zap
} from 'lucide-react';
import AIExplainButton from '@/components/practice/AIExplainButton';
import WeakAreaAnalysis from '@/components/practice/WeakAreaAnalysis';
import { db } from '@/lib/dbClient';

const categoryIcons = {
  'English': <Languages className="w-6 h-6 text-blue-400" />,
  'Analytical': <BrainCircuit className="w-6 h-6 text-purple-400" />,
  'Quantitative': <Calculator className="w-6 h-6 text-green-400" />,
  'Physics': <Microscope className="w-6 h-6 text-amber-400" />,
  'Mathematics': <Calculator className="w-6 h-6 text-emerald-400" />,
  'Computer Science': <Monitor className="w-6 h-6 text-cyan-400" />,
  'Subject': <BookOpen className="w-6 h-6 text-gray-400" />,
};

const sectionColors = {
  'English': 'from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400',
  'Analytical': 'from-purple-500/20 to-pink-500/10 border-purple-500/20 text-purple-400',
  'Quantitative': 'from-green-500/20 to-emerald-500/10 border-green-500/20 text-green-400',
  'Physics': 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
  'Mathematics': 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
  'Computer Science': 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400',
  'Subject': 'from-gray-500/20 to-slate-500/10 border-gray-500/20 text-gray-400',
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
    setSelectedAnswer(i);
    setShowResult(true);
    setAnswers(prev => [...prev, { selected: i, correct: q.correct_answer_index, isCorrect: i === q.correct_answer_index }]);
  };

  const handleNext = () => {
    if (currentIndex < paper.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
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
        className="space-y-6"
      >
        <div className="relative overflow-hidden rounded-3xl p-8 text-center bg-gradient-to-br from-primary/20 via-background to-emerald-500/10 border border-primary/20 shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24 rotate-12" />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-6xl mb-4"
          >
            {score >= 80 ? '👑' : score >= 60 ? '🏆' : '🔥'}
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Session Complete!</h2>
          <p className="text-muted-foreground text-sm mb-6">{paper.title}</p>
          
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-3xl font-black text-primary">{score}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Accuracy</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-3xl font-black text-green-400">{correctCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Correct</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-3xl font-black text-red-400">{paper.questions.length - correctCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Missed</p>
            </div>
          </div>
        </div>

        <WeakAreaAnalysis questions={paper.questions} answers={paper.questions.map((q, i) => ({ selected: answers[i]?.selected, correct: q.correct_answer_index, isCorrect: answers[i]?.isCorrect }))} />

        <div className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Detailed Review
          </h3>
          <div className="grid gap-4">
            {paper.questions.map((q, i) => {
              const ans = answers[i];
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={q.id || i}
                >
                  <Card className="p-5 bg-secondary/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`mt-1 p-1 rounded-full ${ans?.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {ans?.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-tighter ${sectionColors[q.section] || 'bg-secondary'}`}>
                            {q.section}
                          </span>
                        </div>
                        <p className="text-sm font-semibold leading-relaxed">{q.question_text}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
                      {q.options.map((opt, j) => (
                        <div 
                          key={j} 
                          className={`text-xs px-3 py-2 rounded-xl border transition-colors ${
                            j === q.correct_answer_index 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 font-bold' 
                              : j === ans?.selected && !ans?.isCorrect 
                                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                : 'bg-white/5 border-transparent text-muted-foreground'
                          }`}
                        >
                          <span className="opacity-50 mr-2">{String.fromCharCode(65 + j)}.</span>{opt}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 ml-8 p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                          <span className="font-bold text-primary not-italic mr-1">Explanation:</span>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 ml-8">
                      <AIExplainButton 
                        question={q.question_text} 
                        options={q.options} 
                        correctIndex={q.correct_answer_index} 
                        explanation={q.explanation} 
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 sticky bottom-4 z-10">
          <Button variant="outline" className="flex-1 h-14 rounded-2xl bg-background/80 backdrop-blur-xl border-white/10" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit to Library
          </Button>
          <Button className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => { setFinished(false); setCurrentIndex(0); setAnswers([]); setSelectedAnswer(null); setShowResult(false); }}>
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question</p>
            <p className="text-sm font-black text-primary">{currentIndex + 1} <span className="text-muted-foreground font-normal">/ {paper.questions.length}</span></p>
          </div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
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
          <Card className="p-6 sm:p-8 bg-secondary/20 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32" />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${sectionColors[q.section] || 'bg-secondary'}`}>
                {q.section}
              </span>
              <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${
                q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {q.difficulty}
              </span>
            </div>

            {q.topic && <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest mb-2">{q.topic}</p>}
            <h3 className="text-lg sm:text-xl font-bold leading-relaxed mb-8">{q.question_text}</h3>

            <div className="space-y-3">
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
                    className={`w-full group text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                      status === 'idle' ? 'border-white/5 bg-white/5 hover:border-primary/40 hover:bg-primary/5' :
                      status === 'selected' ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)]' :
                      status === 'correct' ? 'border-green-500 bg-green-500/10 text-green-400' :
                      status === 'wrong' ? 'border-red-500 bg-red-500/10 text-red-400' :
                      'border-white/5 opacity-40 grayscale'
                    }`}
                    onClick={() => handleSelect(i)}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      status === 'correct' ? 'bg-green-500 text-white' :
                      status === 'wrong' ? 'bg-red-500 text-white' :
                      status === 'selected' ? 'bg-primary text-white' :
                      'bg-white/10 group-hover:bg-primary/20'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="flex-1 font-medium">{opt}</span>
                    {status === 'correct' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    {status === 'wrong' && <XCircle className="w-5 h-5 text-red-400" />}
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-5 rounded-2xl border-l-4 ${selectedAnswer === q.correct_answer_index ? 'bg-green-500/5 border-green-500' : 'bg-red-500/5 border-red-500'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === q.correct_answer_index ? (
                    <Trophy className="w-4 h-4 text-green-400" />
                  ) : (
                    <Target className="w-4 h-4 text-red-400" />
                  )}
                  <p className={`text-sm font-black uppercase tracking-widest ${selectedAnswer === q.correct_answer_index ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedAnswer === q.correct_answer_index ? 'Genius!' : 'Good effort!'}
                  </p>
                </div>
                {q.explanation && <p className="text-xs text-muted-foreground leading-relaxed italic mb-4">{q.explanation}</p>}
                <AIExplainButton question={q.question_text} options={q.options} correctIndex={q.correct_answer_index} explanation={q.explanation} />
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="h-20">
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 group" onClick={handleNext}>
              {currentIndex < paper.questions.length - 1 ? 'Next Challenge' : 'See Results'}
              <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PastPapers() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [activePaper, setActivePaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await db.db.findMany('questions', {
          where: { is_past_paper: true }
        });
        setQuestions(data || []);
      } catch (e) {
        console.error('Failed to load past papers:', e);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  if (!user?.is_premium) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back Home
        </Button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-secondary/20 rounded-[40px] border border-white/5 backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center rotate-12">
              <Lock className="w-10 h-10 text-primary -rotate-12" />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-full animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Premium Archive</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Unlock over 10,000+ real NAT past paper questions categorized by subject and difficulty.
            </p>
          </div>
          <Button className="bg-primary h-14 px-8 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/30" onClick={() => navigate('/premium')}>
            Upgrade to Premium
          </Button>
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
      className="p-6 max-w-4xl mx-auto space-y-8 pb-32"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter">Past Papers</h1>
            <div className="bg-gradient-to-r from-primary/20 to-emerald-400/20 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium</span>
            </div>
          </div>
          <p className="text-muted-foreground font-medium">Master the NAT by practicing with actual previous exam questions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/')} className="rounded-xl border-white/10 self-start sm:self-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Home
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black">{questions.length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Questions</p>
          </div>
        </div>
        <div className="bg-emerald-500/5 rounded-3xl p-5 border border-emerald-500/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black">{categories.length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Subject Tracks</p>
          </div>
        </div>
        <div className="bg-blue-500/5 rounded-3xl p-5 border border-blue-500/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-black">2026</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Latest Update</p>
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
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Sourcing archive...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 bg-secondary/5 rounded-[40px]">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-10" />
          <h3 className="text-xl font-bold mb-2">The Archive is Empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">No past paper questions have been added to the database yet.</p>
          {user?.role === 'admin' && (
            <Button variant="outline" className="rounded-xl" onClick={() => navigate('/admin/importer')}>
              Open Importer
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={cat}
            >
              <Card 
                className={`group p-6 cursor-pointer bg-gradient-to-br ${sectionColors[cat] || 'from-secondary to-transparent'} border border-white/5 hover:border-primary/40 transition-all duration-500 relative overflow-hidden rounded-[32px]`}
                onClick={() => setActivePaper({ title: `${cat} - Past Papers`, questions: grouped[cat] })}
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {categoryIcons[cat] || <BookOpen className="w-32 h-32" />}
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    {categoryIcons[cat] || <BookOpen className="w-8 h-8" />}
                  </div>
                  <div className="bg-background/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <p className="text-[10px] font-black">{grouped[cat].length} Qs</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-2xl tracking-tight group-hover:text-primary transition-colors">{cat}</h3>
                  <p className="text-xs font-medium text-muted-foreground">Previous exam bank</p>
                </div>

                <div className="mt-6 flex items-center text-primary font-bold text-sm">
                  Start Practice
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-[40px] border border-primary/10 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold">Can't find a subject?</h3>
          <p className="text-sm text-muted-foreground">We are constantly updating our database with new past papers.</p>
        </div>
        <Button className="bg-primary rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/feedback')}>
          Request Subject
        </Button>
      </div>
    </motion.div>
  );
}