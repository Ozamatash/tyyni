import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']

async function getAgentProfile(userId: string, organizationId: string) {
  const { data: agent, error } = await supabase
    .from('agent_profiles')
    .select('id, name, email')
    .eq('clerk_user_id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    return null
  }

  return agent
}

async function verifyTicketAccess(ticketId: string, organizationId: string) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('organization_id')
    .eq('id', ticketId)
    .eq('organization_id', organizationId)
    .single()

  return !error && ticket
}

export async function POST(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    const userId = session?.userId
    const orgId = session?.orgId

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization's UUID from Clerk ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_id', orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { content, isInternal = false } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Get agent profile and verify access
    const agent = await getAgentProfile(userId, org.id)
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Verify ticket access
    const hasAccess = await verifyTicketAccess(params.ticketId, org.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id: params.ticketId,
        organization_id: org.id,
        content,
        sender_type: 'agent',
        sender_id: agent.id,
        is_internal: isInternal
      })
      .select()
      .single()

    if (messageError) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update ticket last activity
    await supabase
      .from('tickets')
      .update({ 
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ticketId)

    return NextResponse.json({ 
      message: {
        ...message,
        sender: agent
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 