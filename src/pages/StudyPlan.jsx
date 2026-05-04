import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Clock, Target, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getSectionLabel, getAllSections } from '@/lib/questionBank';

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

    // Static plan generation without AI
    const result = {
      overview: `You have ${daysLeft} days until your ${user?.nat_group || 'NAT'} exam with ${hoursPerDay} hours/day (${hoursPerWeek} hrs/week). Focus heavily on your weak areas: ${weakLabels.join(', ')}. Spend 60% of your time on weak subjects and 40% on maintaining strong ones.`,
      daily_schedule: [
        {
          label: 'Weekday Routine',
          tasks: [
            `First ${Math.round(hoursPerDay * 0.4 * 60)} min: Practice MCQs from weak areas (${weakLabels.slice(0, 2).join(', ')})`,
            `Next ${Math.round(hoursPerDay * 0.3 * 60)} min: Study theory and notes for your subject section`,
            `Last ${Math.round(hoursPerDay * 0.3 * 60)} min: Quick revision + 5 mixed questions`,
          ]
        },
        {
          label: 'Weekend Plan',
          tasks: [
            'Saturday: Full practice session — 30 MCQs from your weakest section',
            'Sunday: Take a full Mock Test and review all wrong answers carefully',
          ]
        },
        {
          label: 'Weekly Goals',
          tasks: allSubjects.map(s => `${s}: Complete at least 20 practice questions`)
        }
      ],
      weak_area_tips: weakLabels.map(subject => ({
        subject,
        tip: subject === 'English'
          ? 'Focus on Synonyms, Antonyms, and Sentence Completion. Read 1 English passage daily.'
          : subject === 'Analytical Reasoning'
          ? 'Practice Statements Based and Scenario Based questions daily. Try to identify patterns quickly.'
          : subject === 'Quantitative Reasoning'
          ? 'Review Arithmetic, Percentages, and Algebra formulas. Solve at least 10 quant questions daily.'
          : `Review core concepts in ${subject} daily. Focus on MCQs from previous NAT papers.`
      })),
      final_week_strategy: 'Do NOT start new topics. Revise all your notes, attempt 2 full mock tests, review wrong answers only. Sleep well, eat well, stay calm.',
      motivational_message: `You have ${daysLeft} days — that is enough! Stay consistent, trust your preparation, and give your best. Pakistan believes in you! 🇵🇰`
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
      <div className="p-4 space-y-5">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Premium Feature</h2>
          <p className="text-sm text-muted-foreground max-w-xs">AI Study Plan is available for Premium members. Upgrade to get a personalised schedule tailored to your weak areas and test date.</p>
          <Button className="bg-primary mt-2" onClick={() => navigate('/premium')}>Unlock Premium</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Study Plan</h1>
          <span className="bg-gradient-to-r from-primary to-emerald-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
        </div>
        <p className="text-sm text-muted-foreground">Your personalised NAT preparation schedule</p>
      </div>

      {/* Setup Form */}
      <div className="space-y-4">
        {/* Test Date */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Test Date</p>
              <p className="text-xs text-muted-foreground">When is your NAT exam?</p>
            </div>
          </div>
          <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="bg-secondary border-border" />
          {testDate && (() => {
            const days = Math.max(0, Math.round((new Date(testDate) - new Date()) / 86400000));
            return <p className="text-xs text-primary font-medium">{days} days remaining</p>;
          })()}
        </Card>

        {/* Hours per day */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Daily Study Time</p>
              <p className="text-xs text-muted-foreground">How many hours can you study per day?</p>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map(h => (
              <button
                key={h}
                onClick={() => setHoursPerDay(h)}
                className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${hoursPerDay === h ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'border-border text-muted-foreground hover:border-primary/40'}`}
              >
                {h}h
              </button>
            ))}
          </div>
        </Card>

        {/* Weak Areas */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Weak Areas</p>
              <p className="text-xs text-muted-foreground">Select subjects you struggle with</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSections.map(s => (
              <button
                key={s}
                onClick={() => toggleWeak(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${weakAreas.includes(s) ? 'bg-red-500/15 text-red-400 border-red-500/40' : 'border-border text-muted-foreground hover:border-primary/40'}`}
              >
                {weakAreas.includes(s) ? '✗ ' : '+ '}{getSectionLabel(s)}
              </button>
            ))}
          </div>
          {weakAreas.length > 0 && <p className="text-xs text-red-400">{weakAreas.length} weak area{weakAreas.length > 1 ? 's' : ''} selected</p>}
        </Card>

        <Button className="w-full h-12 bg-primary font-semibold text-base rounded-xl" onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating your plan...</>
          ) : (
            plan ? '🔄 Regenerate Plan' : '✨ Generate My Study Plan'
          )}
        </Button>
      </div>

      {/* Plan Output */}
      {plan && !generating && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-medium">YOUR STUDY PLAN</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Overview */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-emerald-500/5 border-primary/25">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <h3 className="font-bold text-primary">Overview</h3>
            </div>
            <p className="text-sm leading-relaxed">{plan.overview}</p>
          </Card>

          {/* Schedule */}
          {plan.daily_schedule?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2">📅 Schedule</h3>
              {plan.daily_schedule.map((block, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                    <h4 className="font-bold text-sm text-primary">{block.label}</h4>
                  </div>
                  <ul className="space-y-2">
                    {block.tasks?.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground/90">{task}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}

          {/* Weak Area Tips */}
          {plan.weak_area_tips?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-base">⚠️ Weak Area Guidance</h3>
              {plan.weak_area_tips.map((tip, i) => (
                <Card key={i} className="p-4 border-l-4 border-l-red-400 border-red-500/15 bg-red-500/5">
                  <h4 className="font-bold text-sm text-red-400 mb-1">{tip.subject}</h4>
                  <p className="text-sm text-foreground/90">{tip.tip}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Final Week */}
          {plan.final_week_strategy && (
            <Card className="p-4 border-l-4 border-l-amber-400 bg-amber-500/5 border-amber-500/15">
              <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">🔥 Final Week Strategy</h3>
              <p className="text-sm leading-relaxed">{plan.final_week_strategy}</p>
            </Card>
          )}

          {/* Motivation */}
          {plan.motivational_message && (
            <Card className="p-4 bg-green-500/5 border-green-500/20 text-center">
              <p className="text-sm text-green-400 font-semibold italic">💪 {plan.motivational_message}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}