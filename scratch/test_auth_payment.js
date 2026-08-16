import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthInsert() {
  console.log("Signing in...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'adnanabdulbasit75@gmail.com',
    password: 'password123'
  });

  if (authErr) {
    console.error("Sign in failed:", authErr);
    return;
  }

  const user = authData.user;
  console.log("Signed in as:", user.email, "ID:", user.id);

  console.log("Testing insert with logged-in user...");
  const fakeOrderId = 'NP-TEST-' + Math.floor(Math.random() * 10000);
  const testPayload = {
    user_email: user.email,
    user_id: user.id,
    plan_price: 450,
    transaction_id: fakeOrderId,
    status: 'pending',
    ai_reason: 'Order ' + fakeOrderId + ' - Monthly Plan - 30 days @ Rs.15/day = Rs.450',
    screenshot_url: 'data:image/jpeg;base64,samplebase64',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('payment_requests').insert(testPayload).select();
  console.log("Insert result:", { data, error });

  if (!error && data && data.length > 0) {
    console.log("Cleaning up test row...");
    await supabase.from('payment_requests').delete().eq('id', data[0].id);
    console.log("Cleaned up successfully.");
  }
}

testAuthInsert();
