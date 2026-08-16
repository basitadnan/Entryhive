import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Checking payment_requests select...");
  const { data: selectData, error: selectErr } = await supabase
    .from('payment_requests')
    .select('*')
    .limit(3);

  console.log("Select Result:", selectData ? `Success: ${selectData.length} records` : null, "Select Err:", selectErr);
  if (selectData && selectData.length > 0) {
    console.log("Sample record structure:", Object.keys(selectData[0]));
    console.log("Sample record:", selectData[0]);
  }

  console.log("Checking notifications table...");
  const { data: nData, error: nErr } = await supabase.from('notifications').select('*').limit(1);
  console.log("Notifications select:", nData ? "Success" : null, "Err:", nErr);

  console.log("Checking referrals table...");
  const { data: rData, error: rErr } = await supabase.from('referrals').select('*').limit(1);
  console.log("Referrals select:", rData ? "Success" : null, "Err:", rErr);
}

test();
