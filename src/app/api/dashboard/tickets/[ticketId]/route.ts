import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
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

    // Fetch ticket with relations
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        assigned_agent:agent_profiles(*),
        messages:messages(
          *,
          sender:agent_profiles(*)
        )
      `)
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .single()

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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

    const { status } = await request.json()

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

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .select(`
        *,
        customer:customers(*),
        assigned_agent:agent_profiles(*),
        messages:messages(
          *,
          sender:agent_profiles(*)
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 