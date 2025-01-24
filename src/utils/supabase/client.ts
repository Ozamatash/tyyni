import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Single Supabase client for both dashboard and customer portal
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
) 