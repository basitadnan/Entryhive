import { supabase } from '../src/lib/supabaseClient.js';

async function testUpdate() {
  const { data, error } = await supabase.from('profiles').update({ is_premium: true }).eq('id', '03c51e88-e715-4721-960d-2185a32b22d1');
  console.log("Update Data:", data);
  console.log("Update Error:", error);
}

testUpdate();
