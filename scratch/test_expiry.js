import { supabase } from '../src/lib/supabaseClient.js';

async function test() {
  const { data, error } = await supabase.from('profiles').update({ premium_expiry_date: null }).eq('id', 'some-id');
  console.log("Error:", error);
}

test();
