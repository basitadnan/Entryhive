import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SessionFeedback({ answers, questions, section, scorePercent }) {
  // Calculate topic stats without AI
  const topicStats = {};
  questions.forEach((q, i) => {
    const ans = answers[i];
    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
    topicStats[q.topic].total++;
    if (ans?.isCorrect) topicStats[q.topic].correct++;
  });

  const weakTopics = Object.entries(topicStats)
    .filter(([_, s]) => s.total > 0 && (s.correct / s.total) < 0.6)
    .map(([topic, s]) => `${topic} (${s.correct}/${s.total} correct)`);

  const strongTopics = Object.entries(topicStats)
    .filter(([_, s]) => s.total > 0 && (s.correct / s.total) >= 0.8)
    .map(([topic]) => topic);

  const verdict = scorePercent >= 70
    ? '🎉 Great job! You are performing well. Keep practicing to maintain this level.'
    : scorePercent >= 50
    ? '📈 Decent attempt! Focus on your weak topics and you will improve quickly.'
    : '💪 Keep going! Review the topics below and try again. Consistency is key.';

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" /> Performance Summary
      </h3>

      {/* Verdict */}
      <Card className={`p-4 ${scorePercent >= 70 ? 'bg-green-500/5 border-green-500/20' : scorePercent >= 50 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <p className="text-sm font-medium">{verdict}</p>
      </Card>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <Card className="p-4 border-red-500/20">
          <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3" /> Topics to Focus On
          </h4>
          <ul className="space-y-1">
            {weakTopics.map((t, i) => (
              <li key={i} className="text-xs text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Strong Topics */}
      {strongTopics.length > 0 && (
        <Card className="p-4 border-green-500/20">
          <h4 className="text-xs font-semibold text-green-400 flex items-center gap-1 mb-2">
            <CheckCircle2 className="w-3 h-3" /> Your Strengths
          </h4>
          <ul className="space-y-1">
            {strongTopics.map((t, i) => (
              <li key={i} className="text-xs text-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tip */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-xs font-semibold text-primary mb-1">🎯 Next Step</p>
        <p className="text-sm">
          {weakTopics.length > 0
            ? `Practice more questions in: ${weakTopics.map(t => t.split(' (')[0]).join(', ')}.`
            : 'You are doing great! Try a harder difficulty or move to a Mock Test.'}
        </p>
      </Card>
    </div>
  );
}