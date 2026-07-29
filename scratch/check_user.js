import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Supabase URL/Key missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const targetEmail = 'areebashariq017@gmail.com';
  console.log(`--- Checking profiles for ${targetEmail} ---`);
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', targetEmail);
  
  if (profileErr) {
    console.error('Error fetching profile:', profileErr.message);
  } else {
    console.log('Profile Data:', profile);
  }

  console.log(`\n--- Checking PracticeSession for ${targetEmail} ---`);
  const { data: sessions, error: sessionErr } = await supabase
    .from('PracticeSession')
    .select('id, section, completed, created_date, score_percentage')
    .eq('user_email', targetEmail);

  if (sessionErr) {
    console.error('Error fetching sessions:', sessionErr.message);
  } else {
    console.log(`Found ${sessions ? sessions.length : 0} sessions:`, sessions);
  }
}

checkUser();
