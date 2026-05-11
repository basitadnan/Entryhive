const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCount() {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Total questions in database:', count);
  
  const { count: bank } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_past_paper', false);
  const { count: past } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_past_paper', true);
  
  console.log('Bank (Practice/Mock):', bank);
  console.log('Past Papers:', past);
}

checkCount();
