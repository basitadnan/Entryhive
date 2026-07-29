import { supabase } from '../src/lib/supabaseClient.js';

async function testFakeCol() {
  const { data, error } = await supabase.from('profiles').update({ fake_column_xyz: null }).eq('id', '03c51e88-e715-4721-960d-2185a32b22d1');
  console.log("Update Error:", error);
}

testFakeCol();
