const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching questions:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns in questions table:', Object.keys(data[0]));
  } else {
    console.log('No data in questions table to infer schema.');
  }
}

checkSchema();
