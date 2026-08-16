// Read-only probe: does the notifications SELECT fail with "permission denied
// for table users", and does a `users` table even respond to anon?
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const probes = [
  ['notifications', () => supabase.from('notifications').select('*').limit(1)],
  ['users', () => supabase.from('users').select('*').limit(1)],
  ['profiles', () => supabase.from('profiles').select('id').limit(1)],
];

for (const [name, run] of probes) {
  const { data, error } = await run();
  console.log(`${name} (anon):`, error ? `ERROR ${JSON.stringify(error)}` : `OK rows=${data?.length}`);
}
