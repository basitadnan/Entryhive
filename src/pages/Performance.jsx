import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { ArrowLeft, BarChart3, TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getSectionLabel } from '@/lib/questionBank';
import { motion } from 'framer-motion';

export default function Performance() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const { data: practiceSessions = [] } = useQuery({
    queryKey: ['practice-sessions-perf'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data } = await supabase
        .from('PracticeSession')
        .select('id, section, score_percentage, total_questions, correct_answers, created_at')
        .eq('user_email', user?.email)
        .eq('completed', true);
      return data || [];
    },
  });

  const { data: mockTests1 = [] } = useQuery({
    queryKey: ['mock-tests-perf-1'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data } = await supabase
        .from('MockTestResult')
        .select('id, score_percentage, created_at')
        .eq('user_email', user?.email)
        .eq('completed', true);
      return data || [];
    },
  });

  const { data: mockTests2 = [] } = useQuery({
    queryKey: ['mock-tests-perf-2'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const { data } = await supabase
        .from('mock_test_results')
        .select('id, score_percentage, created_at')
        .eq('user_email', user?.email)
        .eq('completed', true);
      return data || [];
    },
  });

  // Combine both tables since NAT/AirUniversity uses mock_test_results and FAST uses MockTestResult
  const mockTests = [...mockTests1, ...mockTests2].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));

  const totalTests = practiceSessions.length + mockTests.length;
  const allScores = [...practiceSessions, ...mockTests].map(t => t.score_percentage || 0);
  const avgScore = totalTests > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / totalTests) : 0;
  const bestScore = totalTests > 0 ? Math.round(Math.max(...allScores)) : 0;

  // Section performance from practice
  const sectionData = {};
  practiceSessions.forEach(s => {
    if (!sectionData[s.section]) sectionData[s.section] = { total: 0, correct: 0, sessions: 0 };
    sectionData[s.section].total += s.total_questions || 0;
    sectionData[s.section].correct += s.correct_answers || 0;
    sectionData[s.section].sessions++;
  });

  const sectionChartData = Object.entries(sectionData).map(([key, val]) => ({
    name: getSectionLabel(key).slice(0, 10),
    score: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
    sessions: val.sessions,
  }));

  // Mock test trend
  const mockTrend = mockTests.map((t, i) => ({
    name: `Test ${i + 1}`,
    score: t.score_percentage || 0,
  }));

  // Weak areas
  const weakAreas = Object.entries(sectionData)
    .map(([key, val]) => ({ section: key, score: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Theme colors for charts
  const chartColors = {
    primary: '#10b981', // emerald-500
    accent: '#f43f5e',  // rose-500
    grid: 'hsl(var(--border))',
    text: 'hsl(var(--muted-foreground))',
    bg: 'hsl(var(--card))'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg">
          <p className="text-sm font-bold text-foreground mb-1">{label}</p>
          <p className="text-sm font-bold" style={{ color: payload[0].color }}>
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your progress and identify weak areas</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {totalTests === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">No Data Yet</h3>
          <p className="text-muted-foreground mb-6">Complete practice sessions or mock tests to see your performance analytics.</p>
          <button onClick={() => navigate('/practice')} className="btn-primary py-2.5 px-6 rounded-xl">
            Start Practice
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 w-full h-1 bg-blue-500/50"></div>
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-3" />
              <p className="font-display text-4xl font-bold text-foreground">{totalTests}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">Total Tests</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 w-full h-1 bg-primary/50"></div>
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-3" />
              <p className="font-display text-4xl font-bold text-foreground">{avgScore}%</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">Average Score</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm text-center relative overflow-hidden group hover:border-[hsl(var(--accent))]/50 transition-colors col-span-2 md:col-span-1">
              <div className="absolute top-0 w-full h-1 bg-[hsl(var(--accent))]/50"></div>
              <Award className="w-6 h-6 mx-auto text-[hsl(var(--accent))] mb-3" />
              <p className="font-display text-4xl font-bold text-foreground">{bestScore}%</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">Best Score</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              {/* Section Performance Chart */}
              {sectionChartData.length > 0 && (
                <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                  <h3 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Section Mastery
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }} />
                        <Bar dataKey="score" fill={chartColors.primary} radius={[6, 6, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Mock Test Trend */}
              {mockTrend.length > 0 && (
                <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                  <h3 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" /> Mock Test Progress
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="score" stroke={chartColors.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Weak Areas */}
              {weakAreas.length > 0 && (
                <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                  <h3 className="font-display font-bold text-foreground mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Focus Areas
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">These are your weakest subjects based on recent performance. Dedicate more time here.</p>
                  
                  <div className="space-y-4">
                    {weakAreas.map((area, i) => {
                      const isCritical = area.score < 40;
                      const isWarning = area.score >= 40 && area.score < 60;
                      
                      const barColor = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-primary';
                      const textColor = isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-primary';
                      const bgLight = isCritical ? 'bg-rose-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-primary/10';

                      return (
                        <div key={area.section} className={`p-4 rounded-2xl border ${bgLight} border-transparent`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-background shadow-sm ${textColor}`}>
                                #{i + 1}
                              </span>
                              <span className="font-bold text-foreground">{getSectionLabel(area.section)}</span>
                            </div>
                            <span className={`text-lg font-display font-bold ${textColor}`}>{area.score}%</span>
                          </div>
                          <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${area.score}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button onClick={() => navigate('/practice')} className="w-full mt-6 bg-secondary text-foreground font-bold py-3 rounded-xl hover:bg-secondary/80 transition-colors border border-border">
                    Practice Weak Areas
                  </button>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}