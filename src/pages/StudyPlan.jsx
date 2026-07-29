import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Clock, Target, Loader2, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getSectionLabel, getAllSections } from '@/lib/questionBank';
import { generateStudyPlan, TRACKS } from '@/lib/studyPlanGenerator';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyPlan() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();

  const [testDate, setTestDate] = useState(user?.study_plan_test_date || '');
  const [weakAreas, setWeakAreas] = useState(user?.study_plan_weak_areas || []);
  const [hoursPerDay, setHoursPerDay] = useState(user?.study_plan_hours || 2);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(user?.study_plan_content || null);

  const availableSections = getAllSections(user?.nat_group || 'NAT-IE');

  const toggleWeak = (s) => {
    setWeakAreas(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleGenerate = async () => {
    if (!testDate) { toast.error('Please select your test date'); return; }
    if (weakAreas.length === 0) { toast.error('Please select at least one weak area'); return; }

    setGenerating(true);
    const today = new Date();
    const target = new Date(testDate);
    const daysLeft = Math.max(1, Math.round((target - today) / 86400000));
    const weakLabels = weakAreas.map(s => getSectionLabel(s));
    const allSubjects = availableSections.map(s => getSectionLabel(s));
    const hoursPerWeek = hoursPerDay * 7;

    const totalDays = Math.min(daysLeft, 45); // Cap to 45 days for display
    
    const hrs = hoursPerDay;
    const mcqsPerWeak = hrs <= 2 ? 10 : hrs <= 4 ? 20 : 30;
    const weakList = weakLabels.length > 0 ? weakLabels : ['all sections'];

    const trackMap = {
      'NAT-IE': 'ENGINEERING',
      'NAT-IM': 'MEDICAL',
      'NAT-ICS': 'ICS',
      'NAT-ICOM': 'ICOM',
    };
    const track = trackMap[user?.nat_group] || 'ENGINEERING';

    const subjectMapping = {
      'English': 'English',
      'Analytical Reasoning': 'Analytical',
      'Quantitative Reasoning': 'Quantitative',
      'Physics': 'Physics',
      'Chemistry': 'Chemistry',
      'Mathematics': 'Maths',
      'Biology': 'Biology',
      'Computer Science': 'Computer',
      'Commerce': 'Commerce',
      'Accounting': 'Accounting',
      'Economics': 'Economics',
    };

    const generatorSubjects = weakLabels.map(label => subjectMapping[label] || label);
    // If somehow empty, default to all track subjects (though UI prevents generating without weak subjects)
    const finalSubjects = generatorSubjects.length > 0 ? generatorSubjects : TRACKS[track];

    let generated;
    try {
      generated = generateStudyPlan({
        track,
        subjects: finalSubjects,
        hoursPerDay: Number(hoursPerDay),
        daysLeft: totalDays
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate study plan: ' + err.message);
      setGenerating(false);
      return;
    }

    const daily_schedule = generated.generatedPlan.map(day => ({
      label: day.dayLabel + ': ' + day.phaseLabel,
      tasks: day.subjects.flatMap(sub => 
        sub.blocks.map(b => `[${b.minutes} min] ${b.type} - ${sub.subject}: ${b.topic}${b.note ? ` (${b.note})` : ''}`)
      )
    }));

    // Dynamic plan generation
    const result = {
      overview: `You have ${daysLeft} days until your ${user?.nat_group || 'NAT'} exam. Committing to ${hoursPerDay} hours/day (${hoursPerWeek} hrs/week) will yield significant results. We have formulated an intense day-by-day action plan focusing on your weak areas: ${weakLabels.join(', ')}.`,
      daily_schedule: daily_schedule,
      weak_area_tips: weakLabels.map(subject => ({
        subject,
        tip: subject === 'English'
          ? 'Focus heavily on Contextual Vocabulary and Reading Comprehension techniques. Do 2 passages daily.'
          : subject === 'Analytical Reasoning'
          ? 'Practice mapping out scenarios with quick diagrams. Speed is crucial here.'
          : subject === 'Quantitative Reasoning'
          ? 'Memorize squares up to 25, cubes up to 10, and fraction-to-percentage conversions. Practice mental math.'
          : `Master the foundational theories in ${subject}. Most MCQs test basic application, not deep derivation.`
      })),
      final_week_strategy: 'In the final week, shift entirely to Mock Tests and mistake revision. Your brain needs to get used to the 2-hour continuous pressure.',
      motivational_message: `You have ${daysLeft} days — every single day counts. Stick to the daily plan, trust the process, and you will crush this exam! 🚀`
    };

    setPlan(result);
    await base44.auth.updateMe({
      study_plan_test_date: testDate,
      study_plan_weak_areas: weakAreas,
      study_plan_hours: hoursPerDay,
      study_plan_content: result,
      test_date: testDate,
    });
    setUser(prev => ({ ...prev, test_date: testDate, study_plan_content: result, study_plan_weak_areas: weakAreas, study_plan_hours: hoursPerDay }));
    setGenerating(false);
    toast.success('Study plan created!');
  };

  // Premium gate
  if (!user?.is_premium) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-emerald-400"></div>
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-8 ring-primary/5">
            <Lock className="w-12 h-12 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Premium AI Study Plan</h2>
          <p className="text-muted-foreground max-w-md mb-8 leading-relaxed text-sm">
            Get a personalized, adaptive study schedule tailored specifically to your weak areas and test date. This feature is exclusive to premium members.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full max-w-md mb-8">
            {['Custom daily schedules', 'Weak area targeting', 'Adaptive learning paths', 'Final week strategies'].map(f => (
              <div key={f} className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span className="text-sm font-bold">{f}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/premium')} className="btn-primary w-full max-w-sm py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> Unlock Premium Access
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Calendar className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground">AI Study Plan</h1>
            <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md shadow-sm">Premium</span>
          </div>
          <p className="text-sm text-muted-foreground">Your personalized NAT preparation schedule</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors inline-flex mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Setup Form */}
      <div className="space-y-4">
        {/* Test Date */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-lg">Test Date</p>
              <p className="text-sm text-muted-foreground">When is your NAT exam?</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input 
              type="date" 
              value={testDate} 
              onChange={e => setTestDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]} 
              className="bg-secondary border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1" 
            />
            {testDate && (() => {
              const days = Math.max(0, Math.round((new Date(testDate) - new Date()) / 86400000));
              return <p className="text-sm font-bold text-primary bg-primary/10 px-4 py-3 rounded-xl border border-primary/20 shrink-0">{days} days remaining</p>;
            })()}
          </div>
        </div>

        {/* Hours per day */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-lg">Daily Study Time</p>
              <p className="text-sm text-muted-foreground">How many hours can you dedicate each day?</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(h => (
              <button
                key={h}
                onClick={() => setHoursPerDay(h)}
                className={`py-3 rounded-xl text-base font-bold transition-all border-2 ${hoursPerDay === h ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
              >
                {h} hrs
              </button>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <Target className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-lg">Weak Areas</p>
              <p className="text-sm text-muted-foreground">Select the subjects you struggle with most</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {availableSections.map(s => (
              <button
                key={s}
                onClick={() => toggleWeak(s)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${weakAreas.includes(s) ? 'bg-rose-500/10 text-rose-500 border-rose-500/40 shadow-sm' : 'bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
              >
                {weakAreas.includes(s) ? <span className="text-rose-500 leading-none">✗</span> : <span className="leading-none">+</span>}
                {getSectionLabel(s)}
              </button>
            ))}
          </div>
          {weakAreas.length > 0 && <p className="text-sm font-bold text-rose-500">{weakAreas.length} weak area{weakAreas.length > 1 ? 's' : ''} selected</p>}
        </div>

        <button 
          className="btn-primary w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50" 
          onClick={handleGenerate} 
          disabled={generating}
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating your plan...</>
          ) : (
            plan ? <><Sparkles className="w-5 h-5" /> Regenerate Plan</> : <><Sparkles className="w-5 h-5" /> Generate My Study Plan</>
          )}
        </button>
      </div>

      {/* Plan Output */}
      <AnimatePresence>
        {plan && !generating && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-4 py-1.5 rounded-full border border-border">Your Custom Study Plan</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Overview */}
            <div className="bg-gradient-to-br from-primary/10 to-emerald-500/5 border border-primary/20 rounded-3xl p-8 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="text-xl leading-none">📊</span>
                  </div>
                  <h3 className="font-display font-bold text-primary text-xl">Overview</h3>
                </div>
                <p className="text-base text-foreground leading-relaxed font-medium">{plan.overview}</p>
              </div>
            </div>

            {/* Schedule */}
            {plan.daily_schedule?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-foreground text-xl flex items-center gap-2">
                  <span>📅</span> Recommended Schedule
                </h3>
                {plan.daily_schedule.map((block, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <h4 className="font-display font-bold text-foreground text-base">{block.label}</h4>
                    </div>
                    <ul className="space-y-3">
                      {block.tasks?.map((task, j) => (
                        <li key={j} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground text-sm font-medium leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Weak Area Tips */}
            {plan.weak_area_tips?.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-foreground text-xl flex items-center gap-2">
                  <Target className="w-6 h-6 text-rose-500" /> Weak Area Guidance
                </h3>
                {plan.weak_area_tips.map((tip, i) => (
                  <div key={i} className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 shadow-sm">
                    <h4 className="font-display font-bold text-rose-500 text-lg mb-2">{tip.subject}</h4>
                    <p className="text-foreground text-sm font-medium leading-relaxed">{tip.tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Final Week */}
            {plan.final_week_strategy && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-sm">
                <h3 className="font-display font-bold text-amber-500 text-xl mb-3 flex items-center gap-2">
                  <span className="text-2xl leading-none">🔥</span> Final Week Strategy
                </h3>
                <p className="text-foreground text-sm font-medium leading-relaxed">{plan.final_week_strategy}</p>
              </div>
            )}

            {/* Motivation */}
            {plan.motivational_message && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-lg text-green-600 font-bold italic leading-relaxed">"{plan.motivational_message}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}