import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import { analyzeTicket, applyTicketAnalysis } from '@/services/ai/ticket-processor'
import { getSupabaseOrgId } from '@/utils/organizations'
import type { Database } from '@/types/supabase'

type TicketData = Database['public']['Tables']['tickets']['Row']

export async function POST(request: Request) {
  try {
    const { orgId: clerkOrgId } = await auth()
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get ticket data from request
    const ticketData: { ticketId: string } = await request.json()
    if (!ticketData.ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 })
    }

    // Fetch complete ticket data with customer
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        messages(*)
      `)
      .eq('id', ticketData.ticketId)
      .eq('organization_id', orgId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Fetch available agents
    const { data: agents, error: agentsError } = await supabase
      .from('agent_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'online')  // Changed from 'active' to 'online' to match realtime subscription

    if (agentsError || !agents?.length) {
      return NextResponse.json({ error: 'No agents available' }, { status: 400 })
    }

    // Perform analysis
    const analysis = await analyzeTicket(
      {
        ticket,
        messages: ticket.messages || [],
        customer: ticket.customer
      },
      agents
    )

    // Apply analysis results
    await applyTicketAnalysis(ticketData.ticketId, analysis)

    // Update agent's ticket count using the database function
    if (analysis.agent_id) {
      const { error: updateError } = await supabase
        .rpc('increment_agent_ticket_count', {
          agent_id: analysis.agent_id
        })

      if (updateError) {
        console.error('Error updating agent ticket count:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      ticket: ticketData.ticketId
    })
  } catch (error) {
    console.error('Error in new ticket analysis:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 