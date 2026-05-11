import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle2, AlertCircle, Loader2, Database, FileText } from 'lucide-react';
import { db } from '@/lib/dbClient';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminImporter() {
  const [files, setFiles] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, loaded, importing, success, error
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getTrack = (filename) => {
    const fn = filename.toLowerCase();
    if (fn.includes('ics')) return 'ICS';
    if (fn.includes('nat-ie')) return 'Engineering';
    if (fn.includes('nat-im')) return 'Medical';
    if (fn.includes('nat-ia')) return 'Arts';
    if (fn.includes('nat-gs')) return 'General Science';
    return 'General';
  };

  const parseTextContent = (filename, content) => {
    const questions = [];
    let currentSection = 'General';
    const track = getTrack(filename);
    const lines = content.split('\n');
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      if (line.match(/Quantitative/i)) currentSection = 'Quantitative';
      else if (line.match(/Verbal/i)) currentSection = 'English';
      else if (line.match(/Analytical/i)) currentSection = 'Analytical';
      else if (line.match(/Subject|Computer|Physics|Math|Biology|Chemistry/i)) {
        if (line.match(/Computer/i)) currentSection = 'Computer Science';
        else if (line.match(/Physics/i)) currentSection = 'Physics';
        else if (line.match(/Math/i)) currentSection = 'Mathematics';
        else if (line.match(/Biology/i)) currentSection = 'Biology';
        else if (line.match(/Chemistry/i)) currentSection = 'Chemistry';
        else currentSection = 'Subject';
      }

      const qMatch = line.match(/^(\d+)[.)]\s+(.*)/);
      if (qMatch) {
        if (currentQuestion) questions.push(currentQuestion);
        currentQuestion = {
          section: currentSection,
          question_text: qMatch[2],
          options: [],
          correct_answer_index: null,
          explanation: '',
          difficulty: 'medium',
          is_past_paper: true,
          track: track,
          source_paper: filename.replace('.txt', ''),
          topic: currentSection
        };
        continue;
      }

      const oMatch = line.match(/^([A-Ea-e]|[a-e])[\).]\s+(.*)/) || line.match(/^\(([a-e])\)\s+(.*)/) || line.match(/^([A-D]):\s+(.*)/i);
      if (oMatch && currentQuestion) {
        currentQuestion.options.push(oMatch[2].trim());
        continue;
      }

      const aMatch = line.match(/Answer:\s*([A-Ea-e])/i) || line.match(/correct answer:\s*([A-Ea-e])/i);
      if (aMatch && currentQuestion) {
        const letter = aMatch[1].toUpperCase();
        currentQuestion.correct_answer_index = letter.charCodeAt(0) - 65;
        continue;
      }

      if (line.toLowerCase().startsWith('explanation:')) {
        currentQuestion.explanation = line.substring(line.indexOf(':') + 1).trim();
        continue;
      }
    }
    if (currentQuestion) questions.push(currentQuestion);
    return questions;
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    setFiles(selectedFiles);
    setStatus('parsing');
    setError(null);

    const allParsed = [];
    for (const file of selectedFiles) {
      const content = await file.text();
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          if (Array.isArray(json)) allParsed.push(...json);
          else allParsed.push(json);
        } catch (e) {
          console.error('Failed to parse JSON file', e);
        }
      } else {
        const questions = parseTextContent(file.name, content);
        allParsed.push(...questions);
      }
    }

    setParsedData(allParsed);
    setStatus('loaded');
  };

  const startImport = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setStatus('importing');
    setProgress(0);

    // 1. Fetch existing questions to skip duplicates (high limit to ensure all are checked)
    const { data: existingData } = await supabase.from('questions').select('question_text').limit(100000);
    const existingSet = new Set(existingData?.map(q => q.question_text) || []);
    
    // 2. Filter data
    const filteredData = parsedData.filter(q => !existingSet.has(q.question_text));
    const skippedCount = parsedData.length - filteredData.length;

    if (filteredData.length === 0) {
      setImporting(false);
      setStatus('success');
      toast.info('All questions already exist in the database!');
      return;
    }

    for (let i = 0; i < filteredData.length; i += batchSize) {
      const batch = filteredData.slice(i, i + batchSize).map(q => ({
        category: q.section.toLowerCase(),
        question: q.question_text,
        options: q.options,
        correct_answer_index: q.correct_answer_index,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        is_past_paper: q.is_past_paper || true,
        track: q.track
      }));

      try {
        const { error } = await supabase.from('questions').insert(batch);
        if (error) throw error;
        
        successCount += batch.length;
        setProgress(Math.round(((i + batch.length) / filteredData.length) * 100));
      } catch (err) {
        console.error('Import error', err);
        setError(`Failed to import batch starting at index ${i}: ${err.message}`);
        setStatus('error');
        setImporting(false);
        return;
      }
    }

    if (skippedCount > 0) {
      toast.info(`Import complete. Added ${successCount} questions, skipped ${skippedCount} duplicates.`);
    }

    setImporting(false);
    setStatus('success');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="w-8 h-8 text-primary" />
          NAT Question Importer
        </h1>
        <Button variant="outline" onClick={() => navigate('/admin')}>Back to Admin</Button>
      </div>

      <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 bg-secondary/5">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Upload NAT .txt or .json Files</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Drag and drop multiple .txt or .json files (Quantitative, English, Maths, etc.) 
            and they will be automatically categorized.
          </p>
        </div>
        <Input 
          type="file" 
          accept=".txt,.json" 
          multiple
          onChange={handleFileChange} 
          className="max-w-xs cursor-pointer"
          disabled={importing}
        />
      </Card>

      {status !== 'idle' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-lg">
                {status === 'parsing' ? 'Parsing Files...' : `${files.length} Files Selected`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {parsedData.length} questions parsed and ready to import.
              </p>
            </div>
            {status === 'loaded' && (
              <Button onClick={startImport} disabled={importing} size="lg">
                Upload to Supabase
              </Button>
            )}
          </div>

          {(status === 'importing' || status === 'success') && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>{status === 'importing' ? 'Uploading to Database...' : 'Import Successful!'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-green-400 mb-2" />
              <p className="text-lg font-bold text-green-400">Mission Accomplished!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {parsedData.length} questions are now live in your Past Papers section.
              </p>
              <Button className="mt-4" onClick={() => navigate('/past-papers')}>Go to Past Papers</Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Import Failed</p>
                <p className="text-sm opacity-90">{error}</p>
                <p className="text-xs mt-1 underline">Make sure you created the 'questions' table in Supabase first!</p>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-blue-500/5 border-blue-500/10">
          <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Smart Categorization
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The importer detects sections like <strong>Quantitative</strong>, <strong>Analytical</strong>, and <strong>English</strong> automatically. 
            It also detects tracks (ICS, Medical, Engineering) based on the file name.
          </p>
        </Card>
        <Card className="p-5 bg-amber-500/5 border-amber-500/10">
          <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> File Format
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ensure questions start with a number (e.g., <code>1. What is...</code>) 
            and options start with letters (e.g., <code>A) Option</code>). 
            Answers should be marked with <code>Answer: A</code>.
          </p>
        </Card>
      </div>
    </div>
  );
}
