import { supabase } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';

const isPlaceholder = false; // Forced to false for production stability

// ── Mock Store (localStorage persistence for preview mode) ──
const STORAGE_KEY = 'nat_prep_mock_store';
const SESSION_KEY = 'nat_mock_user';

function getStore() {
  if (!isPlaceholder) return {};
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const init = {
    profiles: [
      { id: 'u1', email: 'free@test.com', full_name: 'Free User', is_premium: false, role: 'user', nat_group: 'NAT-IM', streak: 1, referral_code: 'FREE123', password: 'test123' },
      { id: 'u2', email: 'premium@test.com', full_name: 'Premium User', is_premium: true, role: 'admin', nat_group: 'NAT-IE', streak: 12, referral_code: 'PREM456', password: 'test123' },
      { id: 'mock-admin', email: 'adnanabdulbasit75@gmail.com', full_name: 'Adnan Abdul Basit', is_premium: true, role: 'admin', nat_group: 'NAT-IE', streak: 12, referral_code: 'ADNAN75', password: 'password123' }
    ],
    activation_codes: [],
    referrals: [],
    payment_requests: []
  };
  saveStore(init);
  return init;
}

function saveStore(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

// ── Entity Proxy ──
function createEntityProxy(tableName) {
  return {
    list: async (orderBy, limit) => {
      if (isPlaceholder) {
        let d = getStore()[tableName] || [];
        if (orderBy) { const desc = orderBy.startsWith('-'); const col = desc ? orderBy.slice(1) : orderBy; d.sort((a, b) => (a[col] > b[col] ? (desc ? -1 : 1) : (desc ? 1 : -1))); }
        if (limit) d = d.slice(0, limit);
        return d;
      }
      let q = supabase.from(tableName).select('*');
      if (orderBy) { const desc = orderBy.startsWith('-'); const col = desc ? orderBy.slice(1) : orderBy; q = q.order(col, { ascending: !desc }); }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) { console.error(`list ${tableName}:`, error); return []; }
      return data || [];
    },
    filter: async (filters) => {
      if (isPlaceholder) return (getStore()[tableName] || []).filter(row => Object.entries(filters).every(([k, v]) => row[k] === v));
      let q = supabase.from(tableName).select('*');
      Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
      const { data, error } = await q;
      if (error) { console.error(`filter ${tableName}:`, error); return []; }
      return data || [];
    },
    create: async (record) => {
      if (isPlaceholder) {
        const s = getStore(); if (!s[tableName]) s[tableName] = [];
        const r = { id: `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`, ...record, created_date: new Date().toISOString() };
        s[tableName].push(r); saveStore(s); return r;
      }
      const { data, error } = await supabase.from(tableName).insert(record).select().single();
      if (error) { console.error(`create ${tableName}:`, error); return { id: 'error', ...record }; }
      return data;
    },
    update: async (id, updates) => {
      if (isPlaceholder) {
        const s = getStore(); const t = s[tableName] || [];
        const i = t.findIndex(r => r.id === id);
        if (i !== -1) { t[i] = { ...t[i], ...updates }; saveStore(s); return t[i]; }
        return { id, ...updates };
      }
      const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single();
      if (error) { console.error(`update ${tableName}:`, error); return { id, ...updates }; }
      return data;
    },
    delete: async (id) => {
      if (isPlaceholder) {
        const s = getStore(); const t = s[tableName] || [];
        const i = t.findIndex(r => r.id === id);
        if (i !== -1) { t.splice(i, 1); saveStore(s); return true; }
        return false;
      }
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) console.error(`delete ${tableName}:`, error);
      return !error;
    },
  };
}

const entitiesProxy = new Proxy({}, { get(_, prop) { return createEntityProxy(prop); } });

// ── Main Export ──
export const base44 = {
  db: {
    findMany: async (table, options = {}) => {
      if (isPlaceholder) {
        let d = getStore()[table] || [];
        if (options.where) d = d.filter(r => Object.entries(options.where).every(([k, v]) => r[k] === v));
        return d;
      }
      let q = supabase.from(table).select('*');
      if (options.where) Object.entries(options.where).forEach(([k, v]) => q = q.eq(k, v));
      if (options.orderBy) Object.entries(options.orderBy).forEach(([k, o]) => q = q.order(k, { ascending: o === 'asc' }));
      if (options.limit) q = q.limit(options.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    insert: async (table, data) => {
      if (isPlaceholder) {
        const s = getStore(); if (!s[table]) s[table] = [];
        const r = { id: `mock-${Date.now()}`, ...data };
        s[table].push(r); saveStore(s); return [r];
      }
      const { data: result, error } = await supabase.from(table).insert(data).select();
      if (error) throw error;
      return result;
    },
  },

  entities: entitiesProxy,

  auth: {
    me: async () => {
      if (isPlaceholder) {
        const u = localStorage.getItem(SESSION_KEY);
        return u ? JSON.parse(u) : null;
      }
      
      try {
        // Use getSession (reads from localStorage, instant) instead of getUser (network call)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) return null;
        
        const user = session.user;
        
        // Merge with metadata immediately so we always have a basic user
        const baseUser = { 
          ...user, 
          ...user.user_metadata,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User'
        };

        // Try to fetch/create profile, but don't let it block the entire login
        let profile = null;
        try {
          // Race the profile query against a 5-second timeout
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          const profileTimeout = new Promise((resolve) => 
            setTimeout(() => {
              console.warn('[Auth] Profile query timed out after 5s');
              resolve({ data: null, error: { message: 'Profile query timed out' } });
            }, 5000)
          );
          const { data: profileData, error: profileError } = await Promise.race([profilePromise, profileTimeout]);
          profile = profileData;

          // Auto-create profile if it doesn't exist (Google Sign-in first-time users)
          if (!profile && !profileError) {
            const referralCode = `REF${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            const newProfile = {
              id: user.id,
              email: user.email,
              full_name: baseUser.full_name,
              referral_code: referralCode,
            };
            try {
              const { data: created } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).select().single();
              profile = created || newProfile;
            } catch (createErr) {
              console.warn('[Auth] Could not create profile, using defaults:', createErr);
              profile = newProfile;
            }
          }
        } catch (profileFetchErr) {
          console.warn('[Auth] Profile fetch failed, using base user:', profileFetchErr);
        }

        const merged = { ...baseUser, ...(profile || {}) };
        
        merged.is_premium = profile?.is_premium || false;
        
        // ── Subscription Expiry Logic (non-blocking) ──
        if (profile?.premium_expiry_date) {
          const expiryDate = new Date(profile.premium_expiry_date);
          const now = new Date();
          
          if (expiryDate < now) {
            // Subscription expired — fire and forget the DB update
            supabase.from('profiles').update({ is_premium: false, premium_expiry_date: null }).eq('id', user.id)
              .then(() => console.log('[Auth] Expired premium revoked'))
              .catch(e => console.warn('[Auth] Could not revoke expired premium:', e));
            merged.is_premium = false;
            merged.premium_expiry_date = null;
            merged.subscription_days_left = 0;
          } else {
            // Subscription is active
            const diffTime = Math.abs(expiryDate - now);
            merged.subscription_days_left = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
        } else {
          merged.subscription_days_left = 0;
        }

        merged.is_on_trial = false;
        
        // Auto-grant admin and premium to the specified emails
        if (merged.email === 'adnanabdulbasit75@gmail.com' || merged.email === 'entryhive.contact@gmail.com') {
          merged.role = 'admin';
          merged.is_premium = true;
          merged.subscription_days_left = 10000;
        }

        if (!merged.referral_code) {
          const code = `REF${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
          // Fire and forget — don't block login for a referral code
          supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
            .then(() => console.log('[Auth] Referral code generated'))
            .catch(e => console.warn('[Auth] Could not save referral code:', e));
          merged.referral_code = code;
        }
        return merged;
      } catch (e) {
        console.error('[Auth] Critical error in me():', e);
        // Fallback to basic session info if database call fails
        try {
          const { data: { session } } = await supabase.auth.getSession();
          return session?.user ? { ...session.user, ...session.user.user_metadata } : null;
        } catch (fallbackErr) {
          console.error('[Auth] Even fallback getSession failed:', fallbackErr);
          return null;
        }
      }
    },

    updateMe: async (updates) => {
      const current = await base44.auth.me();
      if (!current) return null;
      if (isPlaceholder) {
        const s = getStore();
        const i = s.profiles.findIndex(u => u.id === current.id);
        if (i !== -1) { s.profiles[i] = { ...s.profiles[i], ...updates }; saveStore(s); localStorage.setItem(SESSION_KEY, JSON.stringify(s.profiles[i])); return s.profiles[i]; }
        return { ...current, ...updates };
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await supabase.from('profiles').update(updates).eq('id', session.user.id);
      return { ...session?.user, ...updates };
    },

    signUp: async (email, password, metadata = {}) => {
      if (isPlaceholder) {
        const s = getStore();
        const exists = s.profiles.find(u => u.email === email);
        if (exists) return { data: null, error: { message: 'Email already registered' } };
        const newUser = {
          id: `u-${Date.now()}`, email, full_name: metadata.full_name || '', is_premium: false,
          role: 'user', nat_group: '', streak: 1, password,
          referral_code: `REF${Math.random().toString(36).slice(2, 7).toUpperCase()}`
        };
        s.profiles.push(newUser); saveStore(s);
        return { data: { user: newUser }, error: null };
      }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
      if (!error && data?.user) {
        // Auto-create profile row
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: metadata.full_name || '',
          referral_code: `REF${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        }, { onConflict: 'id' });
      }
      return { data, error };
    },

    signInWithPassword: async (email, password) => {
      if (isPlaceholder) {
        const s = getStore();
        const u = s.profiles.find(u => u.email === email && u.password === password);
        if (u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); return { data: { user: u, session: true }, error: null }; }
        return { data: null, error: { message: 'Invalid email or password' } };
      }
      return await supabase.auth.signInWithPassword({ email, password });
    },
    
    signInWithGoogle: async (redirectTo) => {
      if (isPlaceholder) {
        return { data: null, error: { message: 'Google login not available in mock mode.' } };
      }
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Match AuthContext.loginWithGoogle: custom scheme on native, site origin on web
          redirectTo: redirectTo || (Capacitor.isNativePlatform() ? 'entryhive://callback' : window.location.origin),
        },
      });
    },

    redirectToLogin: () => { 
      if (window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') {
        window.location.hash = '/login';
      } else {
        window.location.href = '/login';
      }
    },

    logout: async (redirectUrl) => {
      if (isPlaceholder) { 
        localStorage.removeItem(SESSION_KEY); 
        if (window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') {
          window.location.hash = redirectUrl || '/';
        } else {
          window.location.href = redirectUrl || '/';
        }
        return; 
      }
      await supabase.auth.signOut();
      if (window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') {
        window.location.hash = redirectUrl || '/';
      } else {
        window.location.href = redirectUrl || '/';
      }
    },
  },

  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => {
        try { const { generateCompletion } = await import('@/lib/aiClient'); return await generateCompletion(prompt); }
        catch (e) { console.error('LLM error:', e); return 'AI is not configured yet.'; }
      }
    }
  }
};

export { base44 as db };
