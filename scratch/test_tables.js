import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
  const testEmail = `testuser_${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  const { data: signUpData } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  const user = signUpData.user;
  console.log("Logged in user:", user.id);

  console.log("Testing notifications insert...");
  const nRes = await supabase.from('notifications').insert({
    user_email: 'admin',
    title: 'New Order: NP-TEST 💰',
    message: 'Test order message',
    is_read: false
  });
  console.log("Notifications insert:", nRes);

  console.log("Testing referrals insert...");
  const rRes = await supabase.from('referrals').insert({
    referrer_email: 'referrer@gmail.com',
    friend_email: user.email,
    status: 'pending',
    order_id: 'NP-TEST',
    created_date: new Date().toISOString()
  });
  console.log("Referrals insert:", rRes);
}

testTables();
