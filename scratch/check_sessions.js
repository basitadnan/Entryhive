import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSessions() {
  const { data, error } = await supabase
    .from('PracticeSession')
    .select('id, section, completed, created_date, questions_json')
    .eq('completed', false)
    .order('created_date', { ascending: false });
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${data.length} in-progress sessions`);
  data.slice(0, 3).forEach(s => {
    let qCount = 0;
    try { qCount = JSON.parse(s.questions_json).length; } catch(e) {}
    console.log(`- ${s.id}: ${s.section} (created: ${s.created_date}, ${qCount} questions)`);
    // print the first question text to see if it's english
    try { 
        const qs = JSON.parse(s.questions_json);
        if (qs.length > 0) console.log(`  First Q: ${qs[0].question}`);
    } catch(e) {}
  });
}

checkSessions();
