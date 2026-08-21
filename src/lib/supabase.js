import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const configurationError = {
  message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.',
}

let supabaseClient = null

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (error) {
  console.error('[supabase] Failed to initialize client:', error)
}

const unconfiguredClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: configurationError }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe() {} } },
    }),
    signUp: async () => ({ data: null, error: configurationError }),
    signInWithPassword: async () => ({ data: null, error: configurationError }),
    signOut: async () => ({ error: configurationError }),
    resetPasswordForEmail: async () => ({ data: null, error: configurationError }),
    updateUser: async () => ({ data: null, error: configurationError }),
  },
}

export const supabase = supabaseClient || unconfiguredClient

export function isSupabaseConfigured() {
  return Boolean(supabaseClient)
}
