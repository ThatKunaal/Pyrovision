import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (rawUrl && supabaseAnonKey) {
  // Strip /rest/v1 or trailing slashes if present
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
  supabase = createClient(cleanUrl, supabaseAnonKey)
}

export default supabase
