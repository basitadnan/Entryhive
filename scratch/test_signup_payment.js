import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignUpAndInsert() {
  const testEmail = `testuser_${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  console.log("Signing up user:", testEmail);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });

  if (signUpErr) {
    console.error("Sign up failed:", signUpErr);
    return;
  }

  const user = signUpData.user;
  console.log("Signed up user:", user?.id, user?.email);

  console.log("Testing insert into payment_requests...");
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

  console.log("Testing insert without user_id / with different columns...");
  const testPayload2 = {
    user_email: user.email,
    plan_price: 450,
    transaction_id: fakeOrderId + '-2',
    status: 'pending',
    ai_reason: 'test',
    screenshot_url: 'data:image/jpeg;base64,samplebase64',
    created_at: new Date().toISOString()
  };
  const { data: d2, error: e2 } = await supabase.from('payment_requests').insert(testPayload2).select();
  console.log("Insert without user_id result:", { data: d2, error: e2 });
}

testSignUpAndInsert();
