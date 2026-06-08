import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, AlertCircle, FileText, Loader2, Database, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function BankImporter() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [dbStats, setDbStats] = useState({ total: 0, sections: {}, bank: 0, pastPapers: 0 });

  // Fetch current DB stats
  const fetchStats = async () => {
    // Get total count and section breakdown using count feature to bypass 1000 limit
    const { count: total, error: totalError } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    const { count: bankCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_past_paper', false);
    const { count: pastCount } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_past_paper', true);
    
    // For section breakdown, we might still need to fetch but we can do it specifically or just show totals
    // A better way is to do a RPC or just accept the 1000 limit for the section-wise visual breakdown for now
    // but the main counters should be accurate.
    setDbStats({ total: total || 0, bank: bankCount || 0, pastPapers: pastCount || 0, sections: {} });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setResults(null);
  };

  const parseFile = (content, filename) => {
    const lines = content.split('\n');
    const questions = [];
    let currentQ = null;

    // Detect section from filename with support for common abbreviations
    const fn = filename.toLowerCase();
    let category = null;

    if (fn.includes('english') || fn.includes('eng')) category = 'english';
    else if (fn.includes('analytical') || fn.includes('analyt') || fn.includes('reasoning')) category = 'analytical';
    else if (fn.includes('quantitative') || fn.includes('quant')) category = 'quantitative';
    else if (fn.includes('physics') || fn.includes('phy')) category = 'physics';
    else if (fn.includes('chemistry') || fn.includes('chem')) category = 'chemistry';
    else if (fn.includes('mathematics') || fn.includes('math')) category = 'mathematics';
    else if (fn.includes('biology') || fn.includes('bio')) category = 'biology';
    else if (fn.includes('computer') || fn.includes('cs') || fn.includes('comp')) category = 'computer_science';
    else if (fn.includes('commerce')) category = 'commerce';
    else if (fn.includes('accounting') || fn.includes('acc')) category = 'accounting';
    else if (fn.includes('economics') || fn.includes('eco')) category = 'economics';
    else {
      throw new Error(`Could not detect subject from filename "${filename}". Please rename the file to include the subject name (e.g., "english_bank.txt", "cs_questions.txt", "math_test.txt").`);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.toLowerCase().startsWith('q:')) {
        if (currentQ && currentQ.question_text && currentQ.options.length === 4) {
          questions.push(currentQ);
        }
        currentQ = {
          section: category,
          question_text: line.substring(2).trim(),
          options: [],
          correct_answer_index: 0,
          explanation: '',
          difficulty: 'medium',
          is_past_paper: false
        };
      } else if (line.toLowerCase().startsWith('a:') && currentQ) currentQ.options[0] = line.substring(2).trim();
      else if (line.toLowerCase().startsWith('b:') && currentQ) currentQ.options[1] = line.substring(2).trim();
      else if (line.toLowerCase().startsWith('c:') && currentQ) currentQ.options[2] = line.substring(2).trim();
      else if (line.toLowerCase().startsWith('d:') && currentQ) currentQ.options[3] = line.substring(2).trim();
      else if (line.toLowerCase().includes('correct') && currentQ) {
        const parts = line.split(':');
        if (parts.length > 1) {
          const val = parts[1].trim().toUpperCase();
          currentQ.correct_answer_index = val.includes('A') ? 0 : val.includes('B') ? 1 : val.includes('C') ? 2 : val.includes('D') ? 3 : 0;
        }
      } else if (line.toLowerCase().startsWith('explanation:') && currentQ) {
        currentQ.explanation = line.substring(line.indexOf(':') + 1).trim();
      } else if (line.toLowerCase().startsWith('difficulty:') && currentQ) {
        currentQ.difficulty = line.substring(11).trim().toLowerCase();
      }
    }
    
    if (currentQ && currentQ.question_text && currentQ.options.length === 4) {
      questions.push(currentQ);
    }
    
    return questions;
  };

  const handleImport = async () => {
    if (files.length === 0) return toast.error('Please select files first');
    
    setIsUploading(true);
    setProgress(0);
    
    let totalAdded = 0;
    let totalSkipped = 0;
    let fileReports = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await file.text();
        const parsedQs = parseFile(content, file.name);
        
        if (parsedQs.length === 0) {
          toast.warning(`No valid questions found in ${file.name}`);
          fileReports.push({ name: file.name, added: 0, skipped: 0 });
          setProgress(Math.round(((i + 1) / files.length) * 100));
          continue;
        }

        // Fetch existing questions among these texts in chunks of 100
        const parsedTexts = parsedQs.map(q => q.question_text);
        const existingTextsSet = new Set();
        
        for (let j = 0; j < parsedTexts.length; j += 100) {
          const chunk = parsedTexts.slice(j, j + 100);
          const { data: existingQs, error } = await supabase
            .from('questions')
            .select('question_text')
            .in('question_text', chunk);
          if (!error && existingQs) {
            existingQs.forEach(eq => existingTextsSet.add(eq.question_text));
          }
        }
        
        const newQs = parsedQs.filter(q => !existingTextsSet.has(q.question_text));
        const skippedCount = parsedQs.length - newQs.length;
        
        if (newQs.length > 0) {
          const { error } = await supabase.from('questions').insert(newQs);
          if (error) {
            toast.error(`Error in ${file.name}: ${error.message}`);
            continue;
          }
          totalAdded += newQs.length;
        }
        
        totalSkipped += skippedCount;
        fileReports.push({ name: file.name, added: newQs.length, skipped: skippedCount });
      } catch (err) {
        toast.error(`Failed to parse/import ${file.name}: ${err.message}`);
        console.error(err);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setResults({ totalAdded, totalSkipped, fileReports });
    setIsUploading(false);
    fetchStats();
    toast.success(`Import finished! Added ${totalAdded} questions.`);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Button>
        <div className="flex items-center gap-2 text-primary">
          <Database className="w-5 h-5" />
          <span className="font-bold">Live Question Bank</span>
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Question Bank Importer</h1>
        <p className="text-muted-foreground">Bulk upload general practice questions to the cloud database.</p>
      </header>

      {/* DB Stats Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Questions</p>
          <p className="text-3xl font-bold mt-1">{dbStats.total}</p>
        </Card>
        <Card className="p-4 bg-green-500/5 border-green-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Bank Pool</p>
          <p className="text-3xl font-bold mt-1 text-green-400">{dbStats.bank || 0}</p>
        </Card>
        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Past Papers</p>
          <p className="text-3xl font-bold mt-1 text-amber-400">{dbStats.pastPapers || 0}</p>
        </Card>
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Sections</p>
          <p className="text-3xl font-bold mt-1 text-blue-400">{Object.keys(dbStats.sections || {}).length}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="p-6 space-y-6 border-dashed border-2 border-border bg-black/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold">Drop text files here</h3>
              <p className="text-xs text-muted-foreground">Select multiple .txt files (e.g. english.txt, maths.txt)</p>
            </div>
            <input
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <p className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Selected Files ({files.length})
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex justify-between p-2 bg-secondary/30 rounded">
                    <span>{f.name}</span>
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">{Math.round(f.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full h-12 text-black font-bold text-lg" 
                onClick={handleImport} 
                disabled={isUploading}
              >
                {isUploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</> : 'Import All Questions'}
              </Button>
            </div>
          )}
        </Card>

        {/* Results / Help Section */}
        <div className="space-y-6">
          {isUploading && (
            <Card className="p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-end">
                <h3 className="font-bold">Overall Progress</h3>
                <span className="text-sm font-mono">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground animate-pulse text-center">Parsing files and checking for duplicates...</p>
            </Card>
          )}

          {results && (
            <Card className="p-6 space-y-4 border-green-500/30 bg-green-500/5 animate-in zoom-in duration-300">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold">Import Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/40 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">+{results.totalAdded}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">New Questions</p>
                </div>
                <div className="p-3 bg-black/40 rounded-lg">
                  <p className="text-2xl font-bold text-amber-400">{results.totalSkipped}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Skipped (Dupes)</p>
                </div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {results.fileReports.map((r, i) => (
                  <div key={i} className="text-[11px] flex justify-between items-center p-2 border-b border-border/30">
                    <span className="font-medium truncate max-w-[150px]">{r.name}</span>
                    <span className="text-muted-foreground">Added: {r.added} | Skipped: {r.skipped}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {!results && !isUploading && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Formatting Guide</h3>
              </div>
              <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                <p>Ensure your .txt files follow this structure for best results:</p>
                <div className="bg-black/40 p-3 rounded font-mono text-[10px] text-primary/80 border border-primary/20">
                  Q: What is the capital of France?<br />
                  A: London<br />
                  B: Paris<br />
                  C: Berlin<br />
                  D: Rome<br />
                  Correct: B<br />
                  Explanation: Paris is the capital of France.<br />
                  Topic: Geography<br />
                  Difficulty: Easy
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Filenames should include the subject (e.g., english_bank.txt).</li>
                  <li>Questions without 4 options will be automatically skipped.</li>
                  <li>Duplicate questions are detected by their exact text content.</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
