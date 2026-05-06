import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Disable detectSessionInUrl because we use HashRouter.
    // Hash-based routing conflicts with Supabase's implicit OAuth flow 
    // which also puts tokens in the URL hash fragment.
    // We handle OAuth tokens manually in main.jsx and App.jsx instead.
    detectSessionInUrl: false,
  }
})
