import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fullAudit() {
  // 1. Get ALL sections and their counts (practice only)
  const { data, error } = await supabase
    .from('questions')
    .select('section, question_text, is_past_paper')
    .eq('is_past_paper', false)
    .order('section');

  if (error) { console.error(error); return; }

  const sections = {};
  data.forEach(q => {
    if (!sections[q.section]) sections[q.section] = [];
    sections[q.section].push(q.question_text);
  });

  console.log('=== PRACTICE QUESTIONS (is_past_paper=false) BY SECTION ===\n');
  for (const [sec, texts] of Object.entries(sections)) {
    const unique = [...new Set(texts)];
    console.log(`Section: "${sec}" — ${texts.length} rows, ${unique.length} unique`);
    unique.slice(0, 3).forEach((t, i) => console.log(`  ${i+1}. ${t}`));
    console.log('');
  }

  // 2. Also check what the query for specific sections returns
  for (const testSection of ['english', 'analytical', 'mathematics', 'quantitative']) {
    const { data: qData, error: qErr } = await supabase
      .from('questions')
      .select('section, question_text')
      .eq('section', testSection)
      .eq('is_past_paper', false)
      .limit(3);
    
    console.log(`Query .eq('section','${testSection}').eq('is_past_paper',false) => ${qData?.length || 0} results`);
    if (qData) qData.forEach(q => console.log(`  -> section="${q.section}", text="${q.question_text.substring(0,60)}"`));
    console.log('');
  }
}

fullAudit();
