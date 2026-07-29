import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAllSections, getSectionLabel } from '@/lib/questionBank';

// Mapping from section ID to Supabase table name
const TABLE_MAP = {
  english: 'english_questions',
  analytical: 'analytical_questions',
  quantitative: 'quantitative_questions',
  physics: 'physics_questions',
  chemistry: 'chemistry_questions',
  mathematics: 'mathematics_questions',
  biology: 'biology_questions',
  computer_science: 'computer_science_questions',
  commerce: 'commerce_questions',
  accounting: 'accounting_questions',
  economics: 'economics_questions',
};

export default function AdminImporter() {
  const [file, setFile] = useState(null);
  const [selectedSection, setSelectedSection] = useState('english');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [parseStats, setParseStats] = useState(null);

  // Fetch question bank stats
  const { data: tableCounts = {}, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-question-bank-stats'],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      const counts = {};
      for (const [key, tableName] of Object.entries(TABLE_MAP)) {
        const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
        counts[key] = error ? 0 : (count || 0);
      }
      return counts;
    }
  });

  const totalQuestions = Object.values(tableCounts).reduce((a, b) => a + b, 0);
  const englishCount = tableCounts.english || 0;
  const analyticalCount = tableCounts.analytical || 0;
  const quantitativeCount = tableCounts.quantitative || 0;
  const subjectCount = totalQuestions - (englishCount + analyticalCount + quantitativeCount);


  // Parse the raw text file into JSON objects
  const parseFile = (content, targetSection) => {
    const lines = content.split(/\r?\n/);
    const questions = [];
    let current = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('===') || trimmed.startsWith('END OF FILE') || trimmed.startsWith('NAT ') || trimmed.startsWith('(Easy:')) continue;

      if (/^Question(\s+\d+)?\s*:/i.test(trimmed)) {
        if (current && current.question && current.options.length === 4 && current.correct_option !== null && current.correct_option !== undefined) {
          questions.push(current);
        }
        let qText = trimmed.replace(/^Question(\s+\d+)?\s*:\s*/i, '').trim();
        current = { question: qText, options: [], correct_option: null, explanation: '', difficulty: 'medium', is_past_paper: false };
      } else if (current) {
        if (/^A:\s/i.test(trimmed)) current.options[0] = trimmed.replace(/^A:\s*/i, '').trim();
        else if (/^B:\s/i.test(trimmed)) current.options[1] = trimmed.replace(/^B:\s*/i, '').trim();
        else if (/^C:\s/i.test(trimmed)) current.options[2] = trimmed.replace(/^C:\s*/i, '').trim();
        else if (/^D:\s/i.test(trimmed)) current.options[3] = trimmed.replace(/^D:\s*/i, '').trim();
        else if (/^Answer:\s/i.test(trimmed)) {
          let letter = trimmed.replace(/^Answer:\s*/i, '').trim().toUpperCase();
          letter = letter.replace('OPTION ', '').replace('OPTION', '').trim();
          current.correct_option = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[letter];
        } else if (/^[Ee]xplanation:\s/i.test(trimmed)) {
          current.explanation = trimmed.replace(/^[Ee]xplanation:\s*/i, '').trim();
        } else if (/^difficulty:\s/i.test(trimmed)) {
          current.difficulty = trimmed.replace(/^difficulty:\s*/i, '').trim().toLowerCase();
        }
      }
    }
    
    // Push the final question
    if (current && current.question && current.options.length === 4 && current.correct_option !== null && current.correct_option !== undefined) {
      questions.push(current);
    }
    
    return questions;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setParsedQuestions([]);
    setParseStats(null);

    // Auto-detect section based on filename
    const filename = selectedFile.name.toLowerCase();
    const availableSections = Object.keys(TABLE_MAP);
    for (const sec of availableSections) {
      if (filename.includes(sec)) {
        setSelectedSection(sec);
        break;
      }
    }

    // Read and parse immediately for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const qs = parseFile(event.target.result, selectedSection);
      setParsedQuestions(qs);
      
      let easy = 0, medium = 0, hard = 0;
      qs.forEach(q => {
        if (q.difficulty === 'easy') easy++;
        else if (q.difficulty === 'hard') hard++;
        else medium++;
      });
      setParseStats({ total: qs.length, easy, medium, hard });
      
      if (qs.length === 0) {
        toast.error('No valid questions found in file.');
      } else {
        toast.success(`Parsed ${qs.length} questions successfully!`);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUploadToSupabase = async () => {
    if (parsedQuestions.length === 0) return toast.error('No questions to upload');
    
    const tableName = TABLE_MAP[selectedSection];
    if (!tableName) return toast.error(`No Supabase table mapping found for ${selectedSection}`);

    setIsUploading(true);
    
    try {
      // Dynamic import to avoid breaking if supabase config is missing
      const { supabase } = await import('@/lib/supabaseClient');
      
      // We will upload in batches of 50 to avoid payload limits
      const BATCH_SIZE = 50;
      let totalInserted = 0;
      
      for (let i = 0; i < parsedQuestions.length; i += BATCH_SIZE) {
        const batch = parsedQuestions.slice(i, i + BATCH_SIZE);
        
        // Supabase has an ON CONFLICT ignore built-in using standard REST if we configure the DB properly,
        // but for safety we will just try to insert and ignore duplicate key errors
        const { error } = await supabase.from(tableName).insert(batch);
        
        if (error) {
          // If error is unique constraint violation (code 23505), it means SOME questions were duplicates.
          // In a bulk insert, Postgres fails the whole batch if one is duplicate. 
          // To handle this perfectly, we insert them one by one if the batch fails.
          if (error.code === '23505') {
            for (const q of batch) {
              const { error: singleError } = await supabase.from(tableName).insert([q]);
              if (!singleError) totalInserted++;
            }
          } else {
            throw error; // Throw other unexpected errors
          }
        } else {
          totalInserted += batch.length;
        }
      }
      
      toast.success(`Successfully uploaded ${totalInserted} questions to ${tableName}!`);
      
      if (totalInserted < parsedQuestions.length) {
        toast.info(`${parsedQuestions.length - totalInserted} duplicate questions were automatically skipped.`);
      }

      refetchStats();

      setFile(null);
      setParsedQuestions([]);
      setParseStats(null);
      
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full pb-24">
      <div className="flex items-center gap-3 mb-6 border-b border-border/30 pb-4">
        <Database className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Smart Importer</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Upload questions to Supabase</p>
        </div>
      </div>

      {/* Question Bank Stats */}
      <div className="mb-6 space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Question Bank <span className="text-xs font-normal text-muted-foreground ml-auto">{loadingStats ? <Loader2 className="w-3 h-3 animate-spin inline" /> : totalQuestions} Total</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-xl font-bold text-blue-400">{loadingStats ? '-' : englishCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">English</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-xl font-bold text-pink-400">{loadingStats ? '-' : analyticalCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Analytical</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-xl font-bold text-green-400">{loadingStats ? '-' : quantitativeCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Quantitative</p>
          </Card>
          <Card className="p-3 bg-card border-border text-center">
            <p className="text-xl font-bold text-amber-400">{loadingStats ? '-' : subjectCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Subject</p>
          </Card>
        </div>
      </div>

      <Card className="p-6 bg-card border-border space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Select Subject */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <span className="bg-primary text-black w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
              Target Subject Table
            </label>
            <p className="text-[10px] text-muted-foreground mb-2">Select which database table to insert these questions into.</p>
            <select 
              value={selectedSection} 
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-border text-sm focus:border-primary"
            >
              {Object.keys(TABLE_MAP).map(sec => (
                <option key={sec} value={sec}>{getSectionLabel(sec)} ({TABLE_MAP[sec]})</option>
              ))}
            </select>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <span className="bg-primary text-black w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
              Upload .txt File
            </label>
            <p className="text-[10px] text-muted-foreground mb-2">Upload the text file containing the questions.</p>
            <div className="relative">
              <input 
                type="file" 
                accept=".txt" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className={`w-full p-3 rounded-lg border-2 border-dashed flex items-center gap-3 ${file ? 'border-primary bg-primary/5' : 'border-border bg-black/40'}`}>
                <Upload className={`w-5 h-5 ${file ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${file ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {file ? file.name : 'Click or drag file here'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Preview & Upload */}
        {parseStats && (
          <div className="pt-6 border-t border-border/50 space-y-4 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Ready to Upload
                </h3>
                <p className="text-sm text-muted-foreground">
                  Found <strong className="text-white">{parseStats.total}</strong> questions 
                  (Easy: {parseStats.easy}, Med: {parseStats.medium}, Hard: {parseStats.hard})
                </p>
                <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Duplicates will be automatically skipped
                </p>
              </div>
              
              <Button 
                size="lg" 
                className="bg-primary text-black font-bold w-full md:w-auto"
                disabled={isUploading}
                onClick={handleUploadToSupabase}
              >
                {isUploading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading to DB...</>
                ) : (
                  <><Database className="w-5 h-5 mr-2" /> Upload to {TABLE_MAP[selectedSection]}</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
