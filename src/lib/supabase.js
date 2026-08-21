import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const configurationError = {
  message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env.',
}

// Keep the storefront usable when it is started before its environment file
// has been configured. `createClient` throws immediately for missing values,
// which previously prevented React from rendering at all.
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

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : unconfiguredClient

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
}
