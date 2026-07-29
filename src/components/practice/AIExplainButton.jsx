import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function AIExplainButton({ question, options, correctIndex, explanation }) {
  const [open, setOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasBuiltInExplanation = explanation && explanation.trim().length > 5;

  const generateExplanation = async () => {
    if (aiExplanation) return; // Already generated, use cache
    if (hasBuiltInExplanation) return; // Has a built-in one, no need

    setLoading(true);
    setError(null);

    const correctAnswer = options?.[correctIndex] || 'N/A';
    const optionsList = (options || []).map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n');

    const prompt = `You are a brilliant tutor helping a student prepare for the FAST University entry test in Pakistan.

Question: ${question}

Options:
${optionsList}

Correct Answer: ${correctAnswer}

Give a clear, concise explanation (3-5 sentences max) of WHY the correct answer is right. If it's a math question, show the key steps. If it's English, explain the grammar/vocab rule. If it's IQ/logic, walk through the reasoning. Keep it simple and student-friendly. Do NOT restate the question. Do NOT use markdown formatting.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'NAT Prep Hub'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4.1-nano',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || 'Could not generate explanation.';
      setAiExplanation(text.trim());
    } catch (err) {
      console.error('AI Explain error:', err);
      setError('Could not generate explanation right now. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && !hasBuiltInExplanation && !aiExplanation) {
      generateExplanation();
    }
  };

  const displayText = hasBuiltInExplanation ? explanation : aiExplanation;

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:opacity-80 transition-opacity"
      >
        <Sparkles className="w-3 h-3" />
        {hasBuiltInExplanation ? 'View Explanation' : 'Explain with AI ✨'}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground leading-relaxed">
          <p className="font-semibold text-primary mb-1">✅ Correct Answer: {options?.[correctIndex] || 'N/A'}</p>
          
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating explanation...</span>
            </div>
          )}

          {error && (
            <p className="text-[hsl(var(--accent))] mt-1">{error}</p>
          )}

          {displayText && (
            <p className="whitespace-pre-wrap">{displayText}</p>
          )}

          {!loading && !error && !displayText && (
            <p className="text-muted-foreground italic">No explanation available for this question.</p>
          )}
        </div>
      )}
    </div>
  );
}