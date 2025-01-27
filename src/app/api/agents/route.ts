import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseOrgId } from '@/utils/organizations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const self = searchParams.get('self') === 'true'
    const agentId = searchParams.get('agent')
    
    // Get organization ID from auth
    const { orgId: clerkOrgId, userId } = await auth()
    if (!clerkOrgId || !userId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // If self=true, return current agent's details
    if (self) {
      const { data: agent, error } = await supabase
        .from('agent_profiles')
        .select(`
          id,
          name,
          email,
          role,
          status
        `)
        .eq('organization_id', orgId)
        .eq('clerk_user_id', userId)
        .single()

      if (error) {
        console.error('Agent lookup failed:', error)
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }

      return NextResponse.json({ agent })
    }

    // Otherwise return all agents for the organization
    const { data: agents, error } = await supabase
      .from('agent_profiles')
      .select(`
        id,
        name,
        email,
        role,
        status,
        created_at
      `)
      .eq('organization_id', orgId)
      .order('name')

    if (error) {
      console.error('Error fetching agents:', error)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 