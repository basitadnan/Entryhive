import { supabase } from '../src/lib/supabaseClient.js';

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('id, email, is_premium').limit(5);
  console.log("Profiles:", data);
  console.log("Error:", error);
}

checkProfiles();
