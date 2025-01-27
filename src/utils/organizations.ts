import { supabase } from './supabase/server'

/**
 * Get Supabase organization ID from Clerk organization ID
 * This is needed because Clerk uses string IDs (org_xxx) while Supabase uses UUIDs
 */
export async function getSupabaseOrgId(clerkOrgId: string): Promise<string | null> {
  try {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_id', clerkOrgId)
      .single()

    if (error || !org) {
      console.error('Error getting organization:', error)
      return null
    }

    return org.id
  } catch (error) {
    console.error('Error in getSupabaseOrgId:', error)
    return null
  }
}

/**
 * Get organization ID from support email
 * Used in public routes where we don't have Clerk context
 */
export async function getOrgIdFromEmail(email: string): Promise<string | null> {
  try {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('support_email', email)
      .single()

    if (error || !org) {
      console.error('Error getting organization from email:', error)
      return null
    }

    return org.id
  } catch (error) {
    console.error('Error in getOrgIdFromEmail:', error)
    return null
  }
} 
