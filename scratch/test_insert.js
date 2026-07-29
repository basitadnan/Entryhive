import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testInsert() {
  console.log('starting');
  const { data, error } = await supabase.from('payment_requests').insert({
    user_email: 'test@test.com',
    user_id: 'test-id',
    plan_price: 50,
    transaction_id: 'TEST-123',
    status: 'pending',
    ai_reason: 'test',
    screenshot_url: 'data:image/jpeg;base64,test',
    created_at: new Date().toISOString()
  });
  console.log('done', error ? error.message : 'success');
}

testInsert();
