import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { getSupabaseOrgId } from '@/utils/organizations'

type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface SenderInfo {
  id: string
  name: string
  email: string
}

interface SenderMap {
  [key: string]: SenderInfo
}

export async function GET(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const { userId, orgId: clerkOrgId } = await auth()
    
    if (!userId || !clerkOrgId) {
      return NextResponse.json({ error: 'Authentication and organization access required' }, { status: 401 })
    }

    // Get Supabase organization ID
    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Verify agent has access to this ticket
    const { data: agentProfile } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', orgId)
      .single()

    if (!agentProfile) {
      return NextResponse.json({ error: 'Agent profile not found in this organization' }, { status: 403 })
    }

    // Fetch ticket with relations
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        assigned_to:agent_profiles(*),
        messages(
          id,
          content,
          created_at,
          is_internal,
          sender_type,
          sender_id
        )
      `)
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .single()

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError)
      return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
    }

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in GET /api/tickets/[ticketId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const { userId, orgId: clerkOrgId } = await auth()
    
    if (!userId || !clerkOrgId) {
      return NextResponse.json({ error: 'Authentication and organization access required' }, { status: 401 })
    }

    // Get Supabase organization ID
    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Verify agent has access to update tickets
    const { data: agentProfile } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', orgId)
      .single()

    if (!agentProfile) {
      return NextResponse.json({ error: 'Agent profile not found in this organization' }, { status: 403 })
    }

    const body = await request.json()

    // Update ticket
    const { data: ticket, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: body.status,
        priority: body.priority,
        assigned_to: body.assigned_to,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in PATCH /api/tickets/[ticketId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 