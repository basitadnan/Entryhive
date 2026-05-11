const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('questions').select('*').limit(1);
  if (error) {
    console.log('Error or table missing:', error.message);
  } else {
    console.log('Table exists. Row count:', data.length);
  }
}

run();
