import { supabase } from '../src/lib/supabaseClient.js';

async function testExpiry() {
  const { data, error } = await supabase.from('profiles').update({ premium_expiry_date: null }).eq('id', '03c51e88-e715-4721-960d-2185a32b22d1');
  console.log("Update Error:", error);
}

testExpiry();
