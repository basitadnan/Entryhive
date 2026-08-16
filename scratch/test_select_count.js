import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnrrxofmvyamgbspypok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucnJ4b2ZtdnlhbWdic3B5cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU2ODIsImV4cCI6MjA5MzQ1MTY4Mn0.Dyn05z0kZnjaCaWao1lMXcNuUXcl3W-4yGzg9qb0Ik4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSelectAll() {
  const testEmail = `testuser_${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  const { data: signUpData } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  console.log("Logged in user:", signUpData?.user?.id);

  console.log("Testing select all payment_requests...");
  const { data, count, error } = await supabase
    .from('payment_requests')
    .select('id', { count: 'exact', head: true })
    .ilike('ai_reason', '%ENTRYHIVE%')
    .eq('status', 'approved');

  console.log("Result:", { count, error });
}

testSelectAll();
