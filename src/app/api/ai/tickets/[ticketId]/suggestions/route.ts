import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import { generateAgentSuggestions } from '@/services/ai/agent-assistant'
import { getSupabaseOrgId } from '@/utils/organizations'

export async function GET(
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

    // Generate suggestions
    const suggestions = await generateAgentSuggestions({
      ticket,
      messages: messages || [],
      customer: ticket.customer
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
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

    // Generate response suggestion
    const suggestion = await generateAgentSuggestions({
      ticket,
      messages: messages || [],
      customer: ticket.customer
    })

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('Error generating response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 