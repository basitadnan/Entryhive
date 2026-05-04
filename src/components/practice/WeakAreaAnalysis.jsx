import React, { useState, useEffect } from 'react';
import { generateCompletion as callGemini } from '@/lib/aiClient';
import { Card } from '@/components/ui/card';
import { Loader2, Brain, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WeakAreaAnalysis({ questions, answers }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!questions?.length || !answers?.length) { setLoading(false); return; }
    generateAnalysis();
  }, []);

  const generateAnalysis = async () => {
    // Build topic-level performance
    const topicStats = {};
    questions.forEach((q, i) => {
      const topic = q.topic || 'General';
      if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
      topicStats[topic].total++;
      const ans = answers[i];
      const isCorrect = ans?.isCorrect ?? (ans?.selected === q.correct);
      if (isCorrect) topicStats[topic].correct++;
    });

    const topicSummary = Object.entries(topicStats)
      .map(([topic, s]) => `${topic}: ${s.correct}/${s.total} correct`)
      .join(', ');

    const totalCorrect = answers.filter(a => a.isCorrect ?? (a.selected === questions[answers.indexOf(a)]?.correct)).length;
    const score = Math.round((totalCorrect / questions.length) * 100);

    let result;
    try {
      result = await callGemini(
      `A Pakistani student just completed a NAT exam practice session. Analyze their performance and give specific feedback.

Score: ${score}% (${totalCorrect}/${questions.length} correct)
Topic breakdown: ${topicSummary}

Return a JSON with:
- weak_areas: array of {topic, reason, tip} for topics with <60% accuracy (max 3)
- strong_areas: array of topic names they did well in (>70% accuracy)
- overall_verdict: one encouraging sentence summarizing performance
- priority_action: one specific thing they should practice next

Be specific to NAT Pakistan exam. Keep tips concise and actionable.`,
      {
        type: 'object',
        properties: {
          weak_areas: { type: 'array', items: { type: 'object', properties: { topic: { type: 'string' }, reason: { type: 'string' }, tip: { type: 'string' } } } },
          strong_areas: { type: 'array', items: { type: 'string' } },
          overall_verdict: { type: 'string' },
          priority_action: { type: 'string' },
        }
      }
      );
    } catch (e) {
      console.warn('AI analysis unavailable:', e.message);
    }

    setAnalysis(result || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-medium">AI is analysing your weak areas...</span>
        </div>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="p-4 space-y-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-sm">AI Performance Analysis</h3>
      </div>

      {/* Overall verdict */}
      <p className="text-sm text-foreground">{analysis.overall_verdict}</p>

      {/* Weak Areas */}
      {analysis.weak_areas?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Needs Improvement</p>
          </div>
          {analysis.weak_areas.map((area, i) => (
            <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-red-400">📌 {area.topic}</p>
              <p className="text-xs text-muted-foreground">{area.reason}</p>
              <p className="text-xs text-foreground font-medium">💡 {area.tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Strong Areas */}
      {analysis.strong_areas?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">Your Strengths</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.strong_areas.map((topic, i) => (
              <span key={i} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                ✓ {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Priority Action */}
      {analysis.priority_action && (
        <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-0.5">Next Step</p>
            <p className="text-xs text-foreground">{analysis.priority_action}</p>
          </div>
        </div>
      )}
    </Card>
  );
}