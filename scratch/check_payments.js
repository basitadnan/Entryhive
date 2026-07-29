import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkData() {
  const { data, error } = await supabase.from('payment_requests').select('id, status');
  if (error) {
    console.error("Error:", error);
  } else {
    const pending = data.filter(d => d.status === 'pending').length;
    const approved = data.filter(d => d.status === 'approved').length;
    const rejected = data.filter(d => d.status === 'rejected').length;
    console.log(`Total: ${data.length}`);
    console.log(`Pending: ${pending}`);
    console.log(`Approved: ${approved}`);
    console.log(`Rejected: ${rejected}`);
  }
}

checkData();
