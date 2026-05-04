import React, { useState, useEffect } from 'react';
import { getQuestions } from '@/lib/questionBank';
import { saveCustomQuestionsToDB, deleteCustomQuestionsForSection, getAllLocalCustomQuestions, refreshCustomQuestionsCache } from '@/lib/customQuestionsCache';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, AlertCircle, BookOpen, Info } from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { value: 'english', label: 'English', icon: '📚' },
  { value: 'analytical', label: 'Analytical Reasoning', icon: '🧠' },
  { value: 'quantitative', label: 'Quantitative Reasoning', icon: '🔢' },
  { value: 'physics', label: 'Physics', icon: '⚡' },
  { value: 'chemistry', label: 'Chemistry', icon: '🧪' },
  { value: 'mathematics', label: 'Mathematics', icon: '📐' },
  { value: 'biology', label: 'Biology', icon: '🧬' },
  { value: 'computer_science', label: 'Computer Science', icon: '💻' },
  { value: 'commerce', label: 'Commerce', icon: '🏪' },
  { value: 'accounting', label: 'Accounting', icon: '🧾' },
  { value: 'economics', label: 'Economics', icon: '📊' },
];

// Maps section header keywords → section values
const SECTION_KEYWORD_MAP = {
  english: 'english',
  'verbal': 'english',
  analytical: 'analytical',
  'analytical reasoning': 'analytical',
  'logical': 'analytical',
  quantitative: 'quantitative',
  'quantitative reasoning': 'quantitative',
  mathematics: 'mathematics',
  maths: 'mathematics',
  math: 'mathematics',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  'computer science': 'computer_science',
  'computer': 'computer_science',
  cs: 'computer_science',
  commerce: 'commerce',
  accounting: 'accounting',
  economics: 'economics',
};

/**
 * Detect if a line is a section header like "=== English ===" or "## Analytical" or "SECTION: English"
 */
function detectSectionHeader(line) {
  const cleaned = line.replace(/[=#\-*\[\]]/g, '').replace(/section\s*[:\-]?\s*/i, '').trim().toLowerCase();
  for (const [keyword, sectionValue] of Object.entries(SECTION_KEYWORD_MAP)) {
    if (cleaned === keyword || cleaned.startsWith(keyword + ' ') || cleaned.endsWith(' ' + keyword)) {
      return sectionValue;
    }
  }
  return null;
}

/**
 * Robust parser that handles multiple question formats.
 * Splits the text into question blocks, then parses each block.
 */
function parseQuestionsFromText(text) {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into blocks — split on blank lines OR on lines that start with a question number
  // First try splitting by double newlines (blank lines between questions)
  let rawBlocks = normalized.split(/\n{2,}/);

  // If that gives too few blocks, try splitting on question numbers at start of line
  if (rawBlocks.filter(b => b.trim()).length < 2) {
    rawBlocks = normalized.split(/\n(?=\s*(?:Q\.?\s*\d+|Q\d+|\d+\.|\d+\))\s+)/i);
  }

  const questions = [];

  for (const rawBlock of rawBlocks) {
    const lines = rawBlock.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 5) continue;

    // Find the question line (may have a leading number like "1." or "Q1." or "Q. 1")
    let questionLine = '';
    let questionLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const stripped = lines[i].replace(/^\s*(?:Q\.?\s*\d+[\.\):\s]+|\d+[\.\):\s]+)/i, '').trim();
      if (stripped.length > 10 && !/^[a-dA-D][\.\)]\s/.test(lines[i])) {
        questionLine = stripped;
        questionLineIndex = i;
        break;
      }
    }
    if (!questionLine || questionLineIndex === -1) continue;

    // Find options — lines starting with A. B. C. D. (or A) B) etc.)
    const optionLines = lines.filter(l => /^[a-dA-D][\.\)]\s/.test(l));
    if (optionLines.length < 4) continue;

    const options = optionLines.slice(0, 4).map(l =>
      l.replace(/^[a-dA-D][\.\)]\s*/, '').trim()
    );

    // Find answer line
    const answerLine = lines.find(l => /^(answer|ans|correct\s*answer|key)\s*[:=\-]\s*/i.test(l));
    let correctIndex = 0;
    if (answerLine) {
      const cleaned = answerLine.replace(/^(answer|ans|correct\s*answer|key)\s*[:=\-]\s*/i, '').trim();
      const letter = cleaned.match(/^[a-dA-D]/)?.[0];
      if (letter) correctIndex = letter.toUpperCase().charCodeAt(0) - 65;
    }

    // Find explanation
    const explLine = lines.find(l => /^(explanation|explain|reason|solution)\s*[:=\-]\s*/i.test(l));
    const explanation = explLine
      ? explLine.replace(/^(explanation|explain|reason|solution)\s*[:=\-]\s*/i, '').trim()
      : '';

    // Find difficulty
    const diffLine = lines.find(l => /^difficulty\s*[:=\-]\s*/i.test(l));
    let difficulty = 'medium';
    if (diffLine) {
      const d = diffLine.toLowerCase();
      if (d.includes('easy')) difficulty = 'easy';
      else if (d.includes('hard')) difficulty = 'hard';
    }

    // Find topic
    const topicLine = lines.find(l => /^topic\s*[:=\-]\s*/i.test(l));
    const topic = topicLine
      ? topicLine.replace(/^topic\s*[:=\-]\s*/i, '').trim()
      : 'General';

    questions.push({
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      question: questionLine,
      options,
      correct: correctIndex,
      explanation,
      difficulty,
      topic,
      isCustom: true,
    });
  }
  return questions;
}



/**
 * Parse a multi-section .txt file. Detects section headers and assigns questions accordingly.
 * Returns { sectionName: [questions] }
 */
function parseMultiSectionFile(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const sectionBlocks = {}; // sectionValue → raw text
  let currentSection = null;
  let currentLines = [];

  for (const line of lines) {
    const detectedSection = detectSectionHeader(line);
    if (detectedSection) {
      if (currentSection && currentLines.length > 0) {
        sectionBlocks[currentSection] = (sectionBlocks[currentSection] || '') + '\n' + currentLines.join('\n');
      }
      currentSection = detectedSection;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  // flush last block
  if (currentSection && currentLines.length > 0) {
    sectionBlocks[currentSection] = (sectionBlocks[currentSection] || '') + '\n' + currentLines.join('\n');
  }

  // Parse each block
  const result = {};
  for (const [sec, blockText] of Object.entries(sectionBlocks)) {
    result[sec] = parseQuestionsFromText(blockText);
  }
  return result;
}

export default function QuestionImporter() {
  const [mode, setMode] = useState('single'); // single | multi | bulk
  const [selectedSection, setSelectedSection] = useState('english');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState([]);
  const [multiSectionData, setMultiSectionData] = useState({}); // { section: questions[] }
  const [bulkResults, setBulkResults] = useState([]); // [{ fileName, section, count }]
  const [step, setStep] = useState('upload'); // upload | preview | done
  const [stats, setStats] = useState({});

  const loadStats = async () => {
    await refreshCustomQuestionsCache();
    const all = getAllLocalCustomQuestions();
    const s = {};
    SECTIONS.forEach(sec => { s[sec.value] = (all[sec.value] || []).length; });
    setStats(s);
  };

  useEffect(() => { loadStats(); }, []);

  const normalizeQ = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  const readFileAsText = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = rej;
    reader.readAsText(file);
  });

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';

    if (mode === 'bulk') {
      // Multiple files — each named like "english.txt", "physics.txt" etc.
      // Try to detect section from filename, fall back to multi-section parse
      const accumulated = {}; // section → questions[]
      const results = [];
      for (const file of files) {
        if (!file.name.endsWith('.txt')) continue;
        const text = await readFileAsText(file);
        // Try filename → section
        const namePart = file.name.replace('.txt', '').toLowerCase().trim();
        const sectionFromName = SECTION_KEYWORD_MAP[namePart];
        if (sectionFromName) {
          const qs = parseQuestionsFromText(text);
          accumulated[sectionFromName] = [...(accumulated[sectionFromName] || []), ...qs];
          results.push({ fileName: file.name, section: sectionFromName, count: qs.length });
        } else {
          // Try multi-section parse
          const parsed = parseMultiSectionFile(text);
          for (const [sec, qs] of Object.entries(parsed)) {
            accumulated[sec] = [...(accumulated[sec] || []), ...qs];
          }
          const total = Object.values(parsed).reduce((s, a) => s + a.length, 0);
          results.push({ fileName: file.name, section: 'auto-detected', count: total });
        }
      }
      setMultiSectionData(accumulated);
      setBulkResults(results);
      setStep('preview');
      const grand = Object.values(accumulated).reduce((s, a) => s + a.length, 0);
      toast.success(`${files.length} file(s) parsed — ${grand} total questions`);
      return;
    }

    const file = files[0];
    if (!file.name.endsWith('.txt')) { toast.error('Please upload a .txt file'); return; }
    const text = await readFileAsText(file);

    if (mode === 'multi') {
      const parsed = parseMultiSectionFile(text);
      const totalQ = Object.values(parsed).reduce((s, arr) => s + arr.length, 0);
      if (totalQ === 0) { toast.error('No sections/questions detected. Make sure you have section headers like "=== English ===" or "## Quantitative".'); return; }
      setMultiSectionData(parsed);
      setStep('preview');
      const summary = Object.entries(parsed).map(([s, qs]) => `${s}(${qs.length})`).join(', ');
      toast.success(`Detected ${totalQ} questions across sections: ${summary}`);
    } else {
      const qs = parseQuestionsFromText(text);
      const bankQs = getQuestions(selectedSection, 'all', 9999);
      const bankNormalized = new Set(bankQs.map(q => normalizeQ(q.question)));
      const unique = [], duplicates = [];
      qs.forEach(q => {
        if (bankNormalized.has(normalizeQ(q.question))) duplicates.push(q);
        else unique.push(q);
      });
      setParsedQuestions(unique);
      setDuplicateQuestions(duplicates);
      setStep('preview');
      if (qs.length === 0) toast.error('Could not parse any questions — check the format');
      else if (duplicates.length > 0) toast.warning(`${duplicates.length} duplicate(s) skipped, ${unique.length} new question(s) ready`);
      else toast.success(`Parsed ${unique.length} questions`);
    }
  };

  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!parsedQuestions.length) { toast.error('No valid questions to import'); return; }
    setImporting(true);
    await saveCustomQuestionsToDB(selectedSection, parsedQuestions);
    toast.success(`${parsedQuestions.length} questions saved to ${SECTIONS.find(s => s.value === selectedSection)?.label}!`);
    setParsedQuestions([]);
    setDuplicateQuestions([]);
    setStep('done');
    loadStats();
    setImporting(false);
    setTimeout(() => setStep('upload'), 2000);
  };

  const handleMultiImport = async () => {
    const totalQ = Object.values(multiSectionData).reduce((s, arr) => s + arr.length, 0);
    if (!totalQ) { toast.error('No questions to import'); return; }
    setImporting(true);
    for (const [sec, qs] of Object.entries(multiSectionData)) {
      if (qs.length > 0) await saveCustomQuestionsToDB(sec, qs);
    }
    const summary = Object.entries(multiSectionData).map(([s, qs]) => `${qs.length} ${s}`).join(', ');
    toast.success(`Imported: ${summary}`);
    setMultiSectionData({});
    setStep('done');
    loadStats();
    setImporting(false);
    setTimeout(() => setStep('upload'), 2000);
  };

  const handleClearSection = async (section) => {
    await deleteCustomQuestionsForSection(section);
    loadStats();
    toast.success('Questions cleared');
  };

  const totalCustom = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Add Custom Questions</h3>
      </div>

      {totalCustom > 0 && (
        <Card className="p-3 border-primary/20 bg-primary/5">
          <p className="text-xs font-semibold text-primary mb-2">📦 Custom Questions: {totalCustom} total</p>
          <div className="grid grid-cols-2 gap-1">
            {SECTIONS.filter(s => stats[s.value] > 0).map(s => (
              <div key={s.value} className="flex items-center justify-between bg-secondary rounded px-2 py-1">
                <span className="text-xs">{s.icon} {s.label}: <span className="text-primary font-bold">{stats[s.value]}</span></span>
                <button onClick={() => handleClearSection(s.value)} className="text-xs text-red-400 hover:text-red-300 ml-2">✕</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mode Toggle */}
      <div>
        <p className="text-sm font-semibold mb-2">Import Mode:</p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => { setMode('single'); setStep('upload'); setBulkResults([]); setMultiSectionData({}); }}
            className={`p-3 rounded-lg border text-left transition-all ${mode === 'single' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <p className="text-sm font-semibold">📄 Single</p>
            <p className="text-xs text-muted-foreground mt-0.5">1 file → 1 section</p>
          </button>
          <button onClick={() => { setMode('multi'); setStep('upload'); setBulkResults([]); setMultiSectionData({}); }}
            className={`p-3 rounded-lg border text-left transition-all ${mode === 'multi' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <p className="text-sm font-semibold">📂 Multi</p>
            <p className="text-xs text-muted-foreground mt-0.5">1 file, auto-split</p>
          </button>
          <button onClick={() => { setMode('bulk'); setStep('upload'); setBulkResults([]); setMultiSectionData({}); }}
            className={`p-3 rounded-lg border text-left transition-all ${mode === 'bulk' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <p className="text-sm font-semibold">📦 Bulk</p>
            <p className="text-xs text-muted-foreground mt-0.5">Many files at once</p>
          </button>
        </div>
      </div>

      {/* Format Guide */}
      <Card className="p-3 border-amber-500/20 bg-amber-500/5">
        <div className="flex gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-1">{mode === 'multi' ? 'Multi-Section Format (add section headers):' : 'Single Section Format:'}</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{mode === 'multi' ? `=== English ===

1. What is a synonym of happy?
A. Sad
B. Joyful
C. Angry
D. Tired
Answer: B
Difficulty: easy
Topic: Synonyms

=== Analytical ===

1. Find next: 2, 4, 8, 16, ___
A. 24
B. 32
C. 28
D. 30
Answer: B
Difficulty: easy
Topic: Patterns

=== Quantitative ===

1. 40% of 200 = ?
A. 60
B. 70
C. 80
D. 90
Answer: C
Difficulty: easy
Topic: Percentage` : `1. What is 2+2?
A. 3
B. 4
C. 5
D. 6
Answer: B
Explanation: Basic addition.
Difficulty: easy
Topic: Arithmetic`}</pre>
          </div>
        </div>
      </Card>

      {/* Section Selector — only for single mode */}
      {mode === 'single' && (
        <div>
          <p className="text-sm font-semibold mb-2">Select Target Section:</p>
          <div className="grid grid-cols-2 gap-2">
            {SECTIONS.map(s => (
              <button key={s.value} onClick={() => setSelectedSection(s.value)}
                className={`p-2 rounded-lg border text-left transition-all ${selectedSection === s.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <p className="text-sm font-medium">{s.icon} {s.label}</p>
                {stats[s.value] > 0 && <p className="text-xs text-primary mt-0.5">{stats[s.value]} custom</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="font-semibold text-sm">
              {mode === 'bulk' ? 'Select multiple .txt files' : 'Upload .txt file'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === 'bulk'
                ? <span className="text-primary">Name files like "english.txt", "physics.txt" etc.</span>
                : mode === 'multi'
                  ? <span className="text-primary">Auto-detects sections from headers</span>
                  : <span>Target: <span className="text-primary">{SECTIONS.find(s => s.value === selectedSection)?.label}</span></span>
              }
            </p>
          </div>
          <input type="file" accept=".txt" className="hidden" onChange={handleFile}
            multiple={mode === 'bulk'} />
        </label>
      )}

      {/* Bulk preview */}
      {step === 'preview' && mode === 'bulk' && bulkResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-green-400">
              ✓ {Object.values(multiSectionData).reduce((s,a) => s+a.length,0)} total questions from {bulkResults.length} file(s)
            </p>
            <button onClick={() => { setStep('upload'); setBulkResults([]); setMultiSectionData({}); }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <div className="space-y-2">
            {bulkResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
                <div>
                  <p className="text-sm font-semibold">{r.fileName}</p>
                  <p className="text-xs text-muted-foreground">Section: {SECTIONS.find(s => s.value === r.section)?.label || r.section}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.count} questions</span>
              </div>
            ))}
          </div>
          <Button className="w-full bg-primary" onClick={handleMultiImport} disabled={importing}>
            {importing ? 'Saving to database...' : `Import All ${Object.values(multiSectionData).reduce((s,a)=>s+a.length,0)} Questions`}
          </Button>
        </div>
      )}

      {/* Multi-section Preview */}
      {step === 'preview' && mode === 'multi' && Object.keys(multiSectionData).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-green-400">✓ {Object.values(multiSectionData).reduce((s,a) => s+a.length,0)} questions detected across {Object.keys(multiSectionData).length} section(s)</p>
            <button onClick={() => { setStep('upload'); setMultiSectionData({}); }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <div className="space-y-2">
            {Object.entries(multiSectionData).map(([sec, qs]) => {
              const label = SECTIONS.find(s => s.value === sec);
              return (
                <Card key={sec} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{label?.icon} {label?.label || sec}</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{qs.length} questions</span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {qs.slice(0, 3).map((q, i) => (
                      <p key={i} className="text-xs text-muted-foreground line-clamp-1">• {q.question}</p>
                    ))}
                    {qs.length > 3 && <p className="text-xs text-muted-foreground">...and {qs.length - 3} more</p>}
                  </div>
                </Card>
              );
            })}
          </div>
          <Button className="w-full bg-primary" onClick={handleMultiImport} disabled={importing}>
            {importing ? 'Saving to database...' : `Import All ${Object.values(multiSectionData).reduce((s,a)=>s+a.length,0)} Questions → ${Object.keys(multiSectionData).length} Sections`}
          </Button>
        </div>
      )}

      {/* Single Preview */}
      {step === 'preview' && mode === 'single' && (parsedQuestions.length > 0 || duplicateQuestions.length > 0) && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-green-400">✓ {parsedQuestions.length} new question(s) ready</p>
          <button onClick={() => { setStep('upload'); setParsedQuestions([]); setDuplicateQuestions([]); }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
        </div>

        {duplicateQuestions.length > 0 && (
          <Card className="p-3 border-amber-500/20 bg-amber-500/5">
            <p className="text-xs font-semibold text-amber-400 mb-2">⚠️ {duplicateQuestions.length} already in bank — skipped:</p>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {duplicateQuestions.map((q, i) => (
                <p key={i} className="text-xs text-muted-foreground line-clamp-1">• {q.question}</p>
              ))}
            </div>
          </Card>
        )}

        {parsedQuestions.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {parsedQuestions.map((q, i) => (
            <Card key={q.id} className="p-3">
              <p className="text-xs font-semibold text-primary mb-1">Q{i + 1} · {q.difficulty} · {q.topic}</p>
              <p className="text-sm font-medium mb-1">{q.question}</p>
              <div className="grid grid-cols-2 gap-1">
                {q.options.map((opt, j) => (
                  <p key={j} className={`text-xs px-2 py-0.5 rounded ${j === q.correct ? 'bg-green-500/10 text-green-400' : 'text-muted-foreground'}`}>
                    {String.fromCharCode(65 + j)}. {opt}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>
        )}
        {parsedQuestions.length > 0 && (
        <Button className="w-full bg-primary" onClick={handleImport} disabled={importing}>
          {importing ? 'Saving to database...' : `Import ${parsedQuestions.length} Questions → ${SECTIONS.find(s => s.value === selectedSection)?.label}`}
        </Button>
        )}
      </div>
      )}

      {step === 'preview' && mode === 'single' && parsedQuestions.length === 0 && duplicateQuestions.length === 0 && (
        <Card className="p-4 border-red-500/20 bg-red-500/5">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Could not parse any questions</p>
              <p className="text-xs text-muted-foreground mt-1">Make sure options start with A. B. C. D. and there's a blank line between questions.</p>
              <button onClick={() => setStep('upload')} className="text-xs text-primary mt-2 underline">Try again</button>
            </div>
          </div>
        </Card>
      )}

      {step === 'done' && (
        <Card className="p-4 border-green-500/20 bg-green-500/5 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="font-semibold text-green-400">Questions Imported!</p>
        </Card>
      )}
    </div>
  );
}