import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/lib/dbClient';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSectionLabel } from '@/lib/questionBank';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#f97316'];

export default function Performance() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const { data: practiceSessions = [] } = useQuery({
    queryKey: ['practice-sessions-perf'],
    queryFn: () => base44.entities.PracticeSession.filter({ user_email: user?.email, completed: true }),
  });

  const { data: mockTests = [] } = useQuery({
    queryKey: ['mock-tests-perf'],
    queryFn: () => base44.entities.MockTestResult.filter({ user_email: user?.email, completed: true }),
  });

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
    name: getSectionLabel(key).slice(0, 8),
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

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/')} className="text-sm text-muted-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-rose-400" />
        <div>
          <h1 className="text-xl font-bold">Performance</h1>
          <p className="text-sm text-muted-foreground">Analytics and progress tracking</p>
        </div>
      </div>

      {totalTests === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <h3 className="font-semibold mb-1">No data yet</h3>
          <p className="text-sm text-muted-foreground">Complete practice sessions or mock tests to see your performance analytics.</p>
        </Card>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 text-center">
              <Target className="w-4 h-4 mx-auto text-primary mb-1" />
              <p className="text-xl font-bold">{totalTests}</p>
              <p className="text-xs text-muted-foreground">Total Tests</p>
            </Card>
            <Card className="p-3 text-center">
              <TrendingUp className="w-4 h-4 mx-auto text-green-400 mb-1" />
              <p className="text-xl font-bold">{avgScore}%</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </Card>
            <Card className="p-3 text-center">
              <Award className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <p className="text-xl font-bold">{bestScore}%</p>
              <p className="text-xs text-muted-foreground">Best Score</p>
            </Card>
          </div>

          {/* Section Performance */}
          {sectionChartData.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Section Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 10% 20%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 55%)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(0 0% 55%)', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(200 10% 12%)', border: '1px solid hsl(200 10% 20%)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="score" fill="hsl(160 84% 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Mock Test Trend */}
          {mockTrend.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Mock Test Progress</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mockTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 10% 20%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(0 0% 55%)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(0 0% 55%)', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(200 10% 12%)', border: '1px solid hsl(200 10% 20%)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Weak Areas */}
          {weakAreas.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Areas to Improve</h3>
              <div className="space-y-3">
                {weakAreas.map((area, i) => (
                  <div key={area.section} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${area.score < 40 ? 'bg-red-500/20 text-red-400' : area.score < 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>{i + 1}</span>
                      <span className="text-sm">{getSectionLabel(area.section)}</span>
                    </div>
                    <span className={`text-sm font-bold ${area.score < 40 ? 'text-red-400' : area.score < 60 ? 'text-amber-400' : 'text-green-400'}`}>{area.score}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}