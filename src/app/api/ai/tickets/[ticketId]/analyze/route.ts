import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import { analyzeTicket, applyTicketAnalysis } from '@/services/ai/ticket-processor'
import { getSupabaseOrgId } from '@/utils/organizations'

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { orgId: clerkOrgId } = await auth()
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Fetch ticket context
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        assigned_to:agent_profiles!tickets_assigned_to_fkey(*),
        auto_assigned_agent:agent_profiles!tickets_auto_assigned_agent_id_fkey(*)
      `)
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Fetch messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', params.ticketId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true })

    // Fetch available agents
    const { data: agents } = await supabase
      .from('agent_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'online')

    if (!agents?.length) {
      return NextResponse.json({ error: 'No agents available' }, { status: 400 })
    }

    // Perform analysis
    const analysis = await analyzeTicket(
      {
        ticket,
        messages: messages || [],
        customer: ticket.customer
      },
      agents
    )

    // Apply analysis results
    await applyTicketAnalysis(params.ticketId, analysis)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error in ticket analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 