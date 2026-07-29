import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fetchRawData() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'adnanabdulbasit75@gmail.com',
    password: 'password123'
  });
  
  if (authErr) {
    console.error("Auth error:", authErr.message);
  }

  const cutoff = '2026-07-06T00:00:00Z';
  const { data, error } = await supabase
    .from('payment_requests')
    .select('id, user_email, plan_price, status, created_at')
    .eq('status', 'approved')
    .gt('created_at', cutoff);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log(`Found ${data.length} rows approved after cutoff:`);
    console.table(data);
  }
}

fetchRawData();
