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
  console.log("Trying to insert without status...");
  const { data, error } = await supabase.from('Feedback').insert({
    user_email: 'test@example.com',
    user_name: 'Test User',
    message: 'Test message',
  }).select();

  if (error) {
    console.error("Insert error:", error.message, error);
  } else {
    console.log("Insert success!", data);
  }
}
check();
