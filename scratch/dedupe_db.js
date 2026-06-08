import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const csQuestionTexts = [
  "Which topology connects all computers to a central hub?",
  "What does RAM stand for?",
  "Which language is primarily used for web page styling?",
  "Which data structure follows FIFO?",
  "Which device is called the brain of computer?"
];

async function deduplicate() {
  console.log('Fetching all questions from database with stable ordering...');
  
  let allQuestions = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    console.log(`Fetching page ${page + 1}...`);
    const { data, error } = await supabase
      .from('questions')
      .select('id, section, question_text, is_past_paper')
      .order('id')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }
    
    if (!data || data.length === 0) break;
    
    allQuestions.push(...data);
    if (data.length < pageSize) break;
    page++;
  }
  
  console.log(`Fetched ${allQuestions.length} total rows from database.`);
  
  // Group by question_text and is_past_paper to keep them distinct
  const groups = {};
  allQuestions.forEach(q => {
    const key = `${q.question_text.trim().toLowerCase()}|||${q.is_past_paper}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(q);
  });
  
  console.log(`Found ${Object.keys(groups).length} unique groups.`);
  
  const idsToDelete = [];
  const idsToReclassify = [];
  
  for (const [key, rows] of Object.entries(groups)) {
    const keepRow = rows[0];
    const text = keepRow.question_text;
    
    const isCSQuestion = csQuestionTexts.some(cs => text.toLowerCase().includes(cs.toLowerCase()));
    
    if (isCSQuestion && keepRow.section === 'english') {
      idsToReclassify.push(keepRow.id);
    }
    
    const duplicates = rows.slice(1);
    duplicates.forEach(dup => idsToDelete.push(dup.id));
  }
  
  console.log(`Unique rows to keep: ${Object.keys(groups).length}`);
  console.log(`Duplicate rows to delete: ${idsToDelete.length}`);
  console.log(`CS rows to reclassify: ${idsToReclassify.length}`);
  
  if (idsToDelete.length > 0) {
    console.log('Deleting duplicate rows in batches...');
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      const { error } = await supabase
        .from('questions')
        .delete()
        .in('id', batch);
      if (error) {
        console.error(`Error deleting batch starting at index ${i}:`, error);
      } else {
        console.log(`Deleted batch ${Math.floor(i / 100) + 1} of ${Math.ceil(idsToDelete.length / 100)}`);
      }
    }
  }
  
  if (idsToReclassify.length > 0) {
    console.log('Reclassifying CS questions to "computer_science"...');
    const { error } = await supabase
      .from('questions')
      .update({ section: 'computer_science' })
      .in('id', idsToReclassify);
      
    if (error) {
      console.error('Error reclassifying:', error);
    } else {
      console.log('Successfully reclassified CS questions.');
    }
  }
  
  console.log('Deduplication complete!');
}

deduplicate();
