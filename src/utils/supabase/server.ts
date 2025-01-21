import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Create a single supabase client for interacting with your database
export function createServerSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server operations
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Export singleton instance
export const supabase = createServerSupabaseClient()
