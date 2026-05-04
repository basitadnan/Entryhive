import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare, Square, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="p-4 space-y-5">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Premium Feature</h2>
          <p className="text-sm text-muted-foreground max-w-xs">Daily Tasks require a Study Plan, which is a Premium feature. Upgrade to unlock!</p>
          <Button className="bg-primary mt-2" onClick={() => navigate('/premium')}>Unlock Premium</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 pb-10">
      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
          <span className="bg-gradient-to-r from-primary to-emerald-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* All done — show motivational quote */}
      {showQuote && quote && (
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-emerald-500/5 border-primary/30 text-center space-y-2">
          <div className="text-3xl">🎉</div>
          <h2 className="font-bold text-lg text-primary">All Tasks Done!</h2>
          <p className="text-sm italic text-foreground leading-relaxed">"{quote}"</p>
          <p className="text-xs text-muted-foreground">Amazing work! You're one step closer to acing your NAT!</p>
        </Card>
      )}

      {/* Progress */}
      {tasks && (
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Today's Progress</p>
            <p className="text-sm font-bold text-primary">{doneCount}/{tasks.length}</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </Card>
      )}

      {/* Tasks */}
      {tasks ? (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
            <Card
              className={`p-4 cursor-pointer transition-all border-2 ${task.done ? 'border-primary/30 bg-primary/5 opacity-75' : 'border-border hover:border-primary/30'}`}
              onClick={() => toggleTask(task.id)}
            >
              <div className="flex items-start gap-3">
                {task.done
                  ? <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  : <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                  <div className="flex gap-2 mt-1">
                    {task.subject && <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{task.subject}</span>}
                    {task.duration && <span className="text-xs text-primary">⏱ {task.duration}</span>}
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>
          ))}

          <Button variant="outline" className="w-full" onClick={() => { setTasks(null); setQuote(null); setShowQuote(false); localStorage.removeItem(STORAGE_KEY); generateTasks(); }}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Today's Tasks
          </Button>
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4">
          <div className="text-4xl">📋</div>
          <div>
            <h2 className="font-bold">No tasks yet today</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.study_plan_content
                ? 'Generate your personalized tasks based on your study plan'
                : 'You need a Study Plan first to get daily tasks'}
            </p>
          </div>
          {user?.study_plan_content ? (
            <Button className="bg-primary w-full" onClick={generateTasks}>
              <Sparkles className="w-4 h-4 mr-2" /> Get Today's Tasks
            </Button>
          ) : (
            <Button className="bg-primary w-full" onClick={() => navigate('/study-plan')}>
              Create Study Plan First
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}