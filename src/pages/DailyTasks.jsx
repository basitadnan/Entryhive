import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Square, Lock, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/lib/sounds';

const DEFAULT_TASKS = [
  { id: 0, title: 'Solve 10 English Synonyms & Antonyms MCQs', subject: 'English', duration: '20 min', done: false },
  { id: 1, title: 'Practice 10 Analytical Reasoning questions', subject: 'Analytical', duration: '25 min', done: false },
  { id: 2, title: 'Solve 10 Quantitative (Arithmetic & Algebra) MCQs', subject: 'Quantitative', duration: '25 min', done: false },
  { id: 3, title: 'Review your weak topics from past sessions', subject: 'Review', duration: '20 min', done: false },
  { id: 4, title: 'Take a 20-question Mini Mock Test', subject: 'Mock', duration: '30 min', done: false },
];

const STORAGE_KEY = 'daily_tasks_v2';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) return null; // expired
    return parsed;
  } catch { return null; }
}

export default function DailyTasks() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const stored = getStoredTasks();
  const [tasks, setTasks] = useState(stored?.tasks || null);
  const [quote, setQuote] = useState(stored?.quote || null);
  const [showQuote, setShowQuote] = useState(false);

  const allDone = tasks && tasks.every(t => t.done);
  const doneCount = tasks ? tasks.filter(t => t.done).length : 0;

  const generateTasks = () => {
    const weakAreas = user?.study_plan_weak_areas || [];
    const baseTasks = weakAreas.length > 0
      ? [
          { id: 0, title: `Solve 10 MCQs from your weakest subject: ${weakAreas[0]}`, subject: weakAreas[0], duration: '25 min', done: false },
          { id: 1, title: 'Practice 10 Analytical Reasoning questions', subject: 'Analytical', duration: '25 min', done: false },
          { id: 2, title: 'Solve 10 English Vocabulary MCQs (Synonyms & Antonyms)', subject: 'English', duration: '20 min', done: false },
          { id: 3, title: `Review notes and key formulas for ${weakAreas[weakAreas.length - 1] || 'Quantitative'}`, subject: 'Review', duration: '20 min', done: false },
          { id: 4, title: 'Take a 15-question Mini Mock Test and review wrong answers', subject: 'Mock', duration: '30 min', done: false },
        ]
      : DEFAULT_TASKS.map(t => ({ ...t, done: false }));

    const staticQuote = "Success is the sum of small efforts, repeated day in and day out. You've got this! 💪";
    const data = { date: getTodayKey(), tasks: baseTasks, quote: staticQuote };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTasks(baseTasks);
    setQuote(staticQuote);
  };

  const toggleTask = (id) => {
    const wasUndone = tasks.find(t => t.id === id)?.done === false;
    if (wasUndone) sounds.taskDone();
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(updated);
    const stored = getStoredTasks();
    if (stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, tasks: updated }));
    }
    // Check if all done
    if (updated.every(t => t.done)) {
      setShowQuote(true);
    }
  };

  if (!user?.is_premium) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border shadow-sm"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Premium Feature</h2>
          <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">Daily Tasks require a personalized Study Plan, which is an exclusive Premium feature. Upgrade to unlock this and more!</p>
          <button className="btn-primary w-full max-w-xs py-3.5 rounded-xl text-lg font-bold" onClick={() => navigate('/premium')}>Unlock Premium</button>
        </motion.div>
      </div>
    );
  }

  const progressPercent = tasks && tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <CheckSquare className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground">Daily Tasks</h1>
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md shadow-sm">Premium</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Progress */}
      {tasks && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-foreground">Today's Progress</p>
            <p className="font-display text-xl font-bold text-primary">{doneCount}/{tasks.length}</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {allDone && (
            <p className="text-xs font-bold text-green-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> All tasks completed! Great job!
            </p>
          )}
        </motion.div>
      )}

      {/* All done — show motivational quote */}
      <AnimatePresence>
        {showQuote && quote && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-8 bg-card rounded-3xl border border-primary/30 text-center space-y-4 shadow-lg shadow-primary/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="text-5xl animate-bounce-slow">🎉</div>
            <h2 className="font-display text-2xl font-bold text-primary">All Tasks Done!</h2>
            <p className="text-lg italic text-foreground leading-relaxed px-4">"{quote}"</p>
            <p className="text-sm text-muted-foreground">Amazing work! You're one step closer to acing your NAT!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks */}
      {tasks ? (
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
            >
              <div
                className={`p-5 rounded-2xl cursor-pointer transition-all border-2 group ${task.done ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/30 hover:bg-secondary/50'}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 rounded-lg w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-primary text-primary-foreground' : 'bg-secondary border-2 border-border group-hover:border-primary/50'}`}>
                    {task.done && <CheckSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base font-bold transition-all ${task.done ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}>{task.title}</p>
                    <div className={`flex gap-2 mt-2 transition-opacity ${task.done ? 'opacity-50' : 'opacity-100'}`}>
                      {task.subject && <span className="text-xs font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-2.5 py-1 rounded-md border border-border">{task.subject}</span>}
                      {task.duration && <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md">⏱ {task.duration}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-4">
            <button 
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-border bg-card text-foreground font-bold hover:bg-secondary transition-colors"
              onClick={() => { setTasks(null); setQuote(null); setShowQuote(false); localStorage.removeItem(STORAGE_KEY); generateTasks(); }}
            >
              <RefreshCw className="w-5 h-5" /> Refresh Today's Tasks
            </button>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 text-center bg-card rounded-3xl border border-border shadow-sm space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
            <CheckSquare className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">No tasks yet today</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              {user?.study_plan_content
                ? 'Generate your personalized tasks based on your study plan'
                : 'You need a Study Plan first to get daily personalized tasks'}
            </p>
          </div>
          {user?.study_plan_content ? (
            <button className="btn-primary w-full max-w-sm mx-auto py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg" onClick={generateTasks}>
              <Sparkles className="w-5 h-5" /> Get Today's Tasks
            </button>
          ) : (
            <button className="w-full max-w-sm mx-auto py-3.5 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors" onClick={() => navigate('/study-plan')}>
              Create Study Plan First
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}