import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { getSupabaseOrgId } from '@/utils/organizations'

type TicketStatus = Database['public']['Enums']['ticket_status']
type TicketPriority = Database['public']['Enums']['ticket_priority']

export async function POST(req: Request) {
  try {
    const { orgId: clerkOrgId } = await auth()
    
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await req.json()

    // First, create or get a customer for this ticket
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        email: body.customerEmail,
        name: body.customerName,
        organization_id: orgId,
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating/finding customer:', customerError)
      return NextResponse.json({ error: 'Error creating customer' }, { status: 500 })
    }
    
    // Create ticket with proper schema types
    const ticketData: Database['public']['Tables']['tickets']['Insert'] = {
      subject: body.subject,
      organization_id: orgId,
      customer_id: customer.id,
      status: body.status,
      priority: body.priority,
      assigned_to: body.assignedTo || null,
      metadata: {}
    }

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        customer:customers(name, email),
        assigned_to:agent_profiles!tickets_assigned_to_fkey(name),
        auto_assigned_agent:agent_profiles!tickets_auto_assigned_agent_id_fkey(name)
      `)
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return NextResponse.json({ error: 'Error creating ticket' }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { userId, orgId: clerkOrgId } = await auth()
    
    if (!userId || !clerkOrgId) {
      return NextResponse.json({ error: 'Authentication and organization access required' }, { status: 401 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get agent profile for user-specific queries
    const { data: agentProfile } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', orgId)
      .single()

    if (!agentProfile) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const status = url.searchParams.get('status') as TicketStatus | null
    const priority = url.searchParams.get('priority') as TicketPriority | null
    const assignedTo = url.searchParams.get('assignedTo')
    const unassigned = url.searchParams.get('unassigned') === 'true'
    const myTickets = url.searchParams.get('myTickets') === 'true'
    const recentlySolved = url.searchParams.get('recentlySolved') === 'true'

    // Start building the query
    let query = supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(name, email),
        assigned_to:agent_profiles!tickets_assigned_to_fkey(name),
        auto_assigned_agent:agent_profiles!tickets_auto_assigned_agent_id_fkey(name)
      `)
      .eq('organization_id', orgId)

    // Apply filters based on query parameters
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (unassigned) {
      query = query.is('assigned_to', null)
    } else if (assignedTo && assignedTo !== 'All') {
      query = query.eq('assigned_to', assignedTo)
    }
    if (myTickets) {
      query = query.eq('assigned_to', agentProfile.id).eq('status', 'open' as TicketStatus)
    }
    if (recentlySolved) {
      query = query.eq('status', 'solved' as TicketStatus)
    }

    // Always order by creation date, most recent first
    query = query.order('created_at', { ascending: false })

    const { data: tickets, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 