import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { Database } from '@/types/supabase'

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
    const session = await auth()
    console.log('Auth session:', { userId: session?.userId, orgId: session?.orgId })

    const userId = session?.userId
    const orgId = session?.orgId

    if (!userId || !orgId) {
      console.log('Unauthorized: Missing userId or orgId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get the organization's UUID from Clerk ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_id', orgId)
      .single()

    if (orgError) {
      console.log('Organization query error:', orgError)
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get agent profile using Clerk user ID and org UUID
    const { data: agent, error: agentError } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', org.id)
      .single()

    if (agentError) {
      console.log('Agent query error:', agentError)
    }
    console.log('Agent data:', agent)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Fetch ticket with relations using org UUID
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        assigned_agent:agent_profiles(*),
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
      .eq('organization_id', org.id)
      .single()

    if (ticketError) {
      console.log('Ticket query error:', ticketError)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // If ticket exists, fetch sender details for each message
    if (ticket) {
      // Get unique agent IDs and customer IDs from messages
      const agentIds = ticket.messages
        .filter(m => m.sender_type === 'agent')
        .map(m => m.sender_id)
      const customerIds = ticket.messages
        .filter(m => m.sender_type === 'customer')
        .map(m => m.sender_id)

      // Fetch agent details if there are any agent messages
      let agents: SenderMap = {}
      if (agentIds.length > 0) {
        const { data: agentData } = await supabase
          .from('agent_profiles')
          .select('id, name, email')
          .in('id', agentIds)
        
        agents = Object.fromEntries(agentData?.map(a => [a.id, a]) || [])
      }

      // Fetch customer details if there are any customer messages
      let customers: SenderMap = {}
      if (customerIds.length > 0) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, name, email')
          .in('id', customerIds)
        
        customers = Object.fromEntries(customerData?.map(c => [c.id, c]) || [])
      }

      // Attach sender details to each message
      ticket.messages = ticket.messages.map(message => ({
        ...message,
        sender: message.sender_type === 'agent' 
          ? agents[message.sender_id]
          : message.sender_type === 'customer'
            ? customers[message.sender_id]
            : null
      }))
    }

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth()
    const userId = session?.userId
    const orgId = session?.orgId

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, get the organization's UUID from Clerk ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_id', orgId)
      .single()

    if (orgError) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { status } = await request.json()

    // Get agent profile using Clerk user ID and org UUID
    const { data: agent } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', org.id)
      .single()

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Update ticket using org UUID
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ticketId)
      .eq('organization_id', org.id)
      .select(`
        *,
        customer:customers(*),
        assigned_agent:agent_profiles(*),
        messages(
          id,
          content,
          created_at,
          is_internal,
          sender_type,
          sender_id
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    // If ticket exists, fetch sender details for each message
    if (ticket) {
      // Get unique agent IDs and customer IDs from messages
      const agentIds = ticket.messages
        .filter(m => m.sender_type === 'agent')
        .map(m => m.sender_id)
      const customerIds = ticket.messages
        .filter(m => m.sender_type === 'customer')
        .map(m => m.sender_id)

      // Fetch agent details if there are any agent messages
      let agents: SenderMap = {}
      if (agentIds.length > 0) {
        const { data: agentData } = await supabase
          .from('agent_profiles')
          .select('id, name, email')
          .in('id', agentIds)
        
        agents = Object.fromEntries(agentData?.map(a => [a.id, a]) || [])
      }

      // Fetch customer details if there are any customer messages
      let customers: SenderMap = {}
      if (customerIds.length > 0) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('id, name, email')
          .in('id', customerIds)
        
        customers = Object.fromEntries(customerData?.map(c => [c.id, c]) || [])
      }

      // Attach sender details to each message
      ticket.messages = ticket.messages.map(message => ({
        ...message,
        sender: message.sender_type === 'agent' 
          ? agents[message.sender_id]
          : message.sender_type === 'customer'
            ? customers[message.sender_id]
            : null
      }))
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 