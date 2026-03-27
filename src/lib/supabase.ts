import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_RENT
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_RENT ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL_RENT or VITE_SUPABASE_ANON_RENT in .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
