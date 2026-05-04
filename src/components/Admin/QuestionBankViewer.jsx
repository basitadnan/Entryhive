import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getQuestions, getSectionLabel, getSectionIcon } from '@/lib/questionBank';
import { getAllLocalCustomQuestions, refreshCustomQuestionsCache } from '@/lib/customQuestionsCache';
import { RefreshCw } from 'lucide-react';

const ALL_SECTIONS = [
  'english', 'analytical', 'quantitative',
  'physics', 'chemistry', 'mathematics',
  'biology', 'computer_science',
  'commerce', 'accounting', 'economics',
];

const DIFFICULTY_COLORS = {
  easy: 'text-green-400',
  medium: 'text-amber-400',
  hard: 'text-red-400',
};

export default function QuestionBankViewer() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCustomQuestionsCache();
    setRefreshTick(t => t + 1);
    setRefreshing(false);
  };

  const customQs = useMemo(() => getAllLocalCustomQuestions(), [refreshTick]);

  const sectionStats = useMemo(() => {
    return ALL_SECTIONS.map(section => {
      // Get all questions from bank (large number to get all)
      const qs = getQuestions(section, 'all', 9999);
      const customCount = (customQs[section] || []).length;
      const builtInCount = qs.length - customCount;

      const byDifficulty = { easy: 0, medium: 0, hard: 0 };
      qs.forEach(q => {
        const d = q.difficulty || 'medium';
        if (byDifficulty[d] !== undefined) byDifficulty[d]++;
      });

      const topics = [...new Set(qs.map(q => q.topic).filter(Boolean))];

      return {
        section,
        label: getSectionLabel(section),
        icon: getSectionIcon(section),
        total: qs.length,
        builtIn: builtInCount,
        custom: customCount,
        byDifficulty,
        topics,
      };
    });
  }, [customQs]);

  const grandTotal = sectionStats.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-4">
      {/* Grand Total */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Total Question Bank</p>
            <p className="text-3xl font-bold">{grandTotal.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">across {ALL_SECTIONS.length} subjects</p>
          </div>
          <div className="text-right text-xs text-muted-foreground space-y-1">
            <p>Built-in: {sectionStats.reduce((s, x) => s + x.builtIn, 0)}</p>
            <p className="text-amber-400 font-semibold">Custom (DB): {sectionStats.reduce((s, x) => s + x.custom, 0)}</p>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} className="text-xs h-7 px-2 mt-1">
              <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Per Section */}
      <div className="space-y-3">
        {sectionStats.map(s => (
          <Card key={s.section} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.total} total</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{s.total}</p>
                <p className="text-xs text-muted-foreground">{s.builtIn} built-in</p>
                {s.custom > 0 && (
                  <p className="text-xs text-amber-400">+{s.custom} custom</p>
                )}
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="flex gap-3 mt-3">
              {Object.entries(s.byDifficulty).map(([diff, count]) => (
                <div key={diff} className="flex items-center gap-1">
                  <span className={`text-xs font-semibold ${DIFFICULTY_COLORS[diff]}`}>{count}</span>
                  <span className="text-xs text-muted-foreground">{diff}</span>
                </div>
              ))}
            </div>

            {/* Topics */}
            {s.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {s.topics.slice(0, 6).map(t => (
                  <span key={t} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>
                ))}
                {s.topics.length > 6 && (
                  <span className="text-xs text-muted-foreground">+{s.topics.length - 6} more</span>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}