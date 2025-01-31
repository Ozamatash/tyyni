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
        assigned_to:agent_profiles!tickets_assigned_to_fkey(*),
        auto_assigned_agent:agent_profiles!tickets_auto_assigned_agent_id_fkey(*),
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

    // Get current ticket state to check for changes
    const { data: currentTicket } = await supabase
      .from('tickets')
      .select('status, assigned_to')
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .single()

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

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

    // Handle agent ticket count updates
    try {
      // If status changed to solved/closed, decrement the current agent's count
      if (
        currentTicket.status !== body.status && 
        (body.status === 'solved' || body.status === 'closed') &&
        currentTicket.assigned_to
      ) {
        await supabase.rpc('decrement_agent_ticket_count', {
          agent_id: currentTicket.assigned_to
        })
      }

      // If status changed from solved/closed to open/pending, increment the new agent's count
      if (
        currentTicket.status !== body.status &&
        (currentTicket.status === 'solved' || currentTicket.status === 'closed') &&
        (body.status === 'open' || body.status === 'pending') &&
        body.assigned_to
      ) {
        await supabase.rpc('increment_agent_ticket_count', {
          agent_id: body.assigned_to
        })
      }

      // If assigned agent changed while ticket is open/pending
      if (
        currentTicket.assigned_to !== body.assigned_to &&
        body.status !== 'solved' && 
        body.status !== 'closed'
      ) {
        // Decrement old agent's count if there was one
        if (currentTicket.assigned_to) {
          await supabase.rpc('decrement_agent_ticket_count', {
            agent_id: currentTicket.assigned_to
          })
        }
        // Increment new agent's count if there is one
        if (body.assigned_to) {
          await supabase.rpc('increment_agent_ticket_count', {
            agent_id: body.assigned_to
          })
        }
      }
    } catch (countError) {
      // Log but don't fail the request
      console.warn('Error updating agent ticket counts:', countError)
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error in PATCH /api/tickets/[ticketId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 