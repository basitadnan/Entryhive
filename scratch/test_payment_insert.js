import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  console.log("Testing insert into payment_requests with anon client...");
  const fakeOrderId = 'NP-TEST1234';
  const testPayload = {
    user_email: 'testuser@example.com',
    user_id: '00000000-0000-0000-0000-000000000000',
    plan_price: 450,
    transaction_id: fakeOrderId,
    status: 'pending',
    ai_reason: 'Order NP-TEST1234 - Monthly Plan - 30 days @ Rs.15/day = Rs.450',
    screenshot_url: 'data:image/jpeg;base64,samplebase64',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('payment_requests').insert(testPayload).select();
  console.log("Insert result:", { data, error });

  if (!error && data && data.length > 0) {
    console.log("Cleaning up test row...");
    await supabase.from('payment_requests').delete().eq('transaction_id', fakeOrderId);
  }
}

testInsert();
