import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orgSlug = searchParams.get('org')
    const self = searchParams.get('self') === 'true'
    const agentId = searchParams.get('agent')
    
    if (!orgSlug) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 })
    }

    // Get organization ID from slug
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // If self=true, return current agent's details
    if (self && agentId) {
      const { data: agent, error } = await supabase
        .from('agent_profiles')
        .select(`
          id,
          name,
          email,
          role,
          status
        `)
        .eq('organization_id', org.id)
        .eq('id', agentId)
        .single()

      if (error) {
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
      .eq('organization_id', org.id)
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