import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('Feedback').select('*').limit(1);
  if (error) {
    console.error("Error with 'Feedback':", error.message);
  } else {
    console.log("'Feedback' table exists! Data:", data);
  }

  const { data: d2, error: e2 } = await supabase.from('feedback').select('*').limit(1);
  if (e2) {
    console.error("Error with 'feedback':", e2.message);
  } else {
    console.log("'feedback' table exists! Data:", d2);
  }

  const { data: d3, error: e3 } = await supabase.from('feedbacks').select('*').limit(1);
  if (e3) {
    console.error("Error with 'feedbacks':", e3.message);
  } else {
    console.log("'feedbacks' table exists! Data:", d3);
  }
}
check();
