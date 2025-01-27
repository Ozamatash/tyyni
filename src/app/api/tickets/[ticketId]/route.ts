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
    const { orgId: clerkOrgId } = await auth()
    
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
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

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const { orgId: clerkOrgId } = await auth()
    
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { status, priority, assigned_to } = await request.json()

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({ 
        status,
        priority,
        assigned_to,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)
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