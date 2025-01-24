import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const session = await auth()
    const userId = session.userId
    const orgId = session.orgId

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, isInternal = false } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Get agent profile
    const { data: agent } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', orgId)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Get ticket to verify organization
    const { data: ticket } = await supabase
      .from('tickets')
      .select('organization_id')
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: params.ticketId,
        organization_id: orgId,
        content,
        sender_type: 'agent',
        sender_id: agent.id,
        is_internal: isInternal
      })
      .select(`
        *,
        sender:agent_profiles(*)
      `)
      .single()

    if (error) {
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

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 