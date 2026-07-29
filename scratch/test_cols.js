import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testCols() {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('amount')
    .limit(1);
  console.log("Amount check:", error ? error.message : "Exists");

  const { data: d2, error: e2 } = await supabase
    .from('payment_requests')
    .select('plan_price')
    .limit(1);
  console.log("plan_price check:", e2 ? e2.message : "Exists");
  
  const { data: d3, error: e3 } = await supabase
    .from('payment_requests')
    .select('*')
    .limit(1);
  if (d3 && d3.length > 0) {
    console.log("Columns:", Object.keys(d3[0]));
  } else {
    console.log("Star error:", e3?.message);
  }
}

testCols();
