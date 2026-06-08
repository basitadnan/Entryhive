import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clean() {
  console.log('Finding questions to clean up...');
  
  const { data: qs, error: findError } = await supabase
    .from('questions')
    .select('id, question_text, section, is_past_paper')
    .eq('section', 'english')
    .eq('is_past_paper', false);

  if (findError) {
    console.error('Error finding questions:', findError);
    return;
  }

  console.log(`Found ${qs?.length} questions.`);
  if (qs && qs.length > 0) {
    console.log('Sample of found questions:');
    qs.slice(0, 5).forEach((q, idx) => {
      console.log(`${idx+1}. Q: ${q.question_text}, Sec: ${q.section}, PastPaper: ${q.is_past_paper}`);
    });
  }
}

clean();
