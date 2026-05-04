import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIExplainButton({ question, options, correctIndex, explanation }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:opacity-80 transition-opacity"
      >
        <Sparkles className="w-3 h-3" />
        View Explanation
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground leading-relaxed">
          <p className="font-semibold text-primary mb-1">✅ Correct Answer: {options[correctIndex]}</p>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}