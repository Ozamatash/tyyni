import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type AgentProfile = Pick<Database['public']['Tables']['agent_profiles']['Row'], 'id' | 'name'>

interface TicketWithMessages {
  id: string
  subject: string
  status: Database['public']['Enums']['ticket_status']
  created_at: string | null
  customer: Pick<Customer, 'id' | 'name' | 'email'>
  messages: (Message & {
    sender: Pick<Customer | AgentProfile, 'id' | 'name'> | null
  })[]
}

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  const { ticketId } = params
  try {
    // Get customer token from header
    const token = request.headers.get('x-customer-token')
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    // Validate token and get customer details
    const { data: tokenData, error: tokenError } = await supabase
      .from('customer_access_tokens')
      .select('customer_id, email')
      .eq('token', token)
      .eq('status', 'active')
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Fetch ticket with customer validation
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id,
        subject,
        status,
        created_at,
        customer:customers!inner(
          id,
          name,
          email
        )
      `)
      .eq('id', ticketId)
      .eq('customer_id', tokenData.customer_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Fetch messages (excluding internal notes)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Fetch senders for messages
    const messagesWithSenders = await Promise.all(messages.map(async (message) => {
      if (message.sender_type === 'agent') {
        const { data: sender } = await supabase
          .from('agent_profiles')
          .select('id, name')
          .eq('id', message.sender_id)
          .single()
        return { ...message, sender }
      } else if (message.sender_type === 'customer') {
        const { data: sender } = await supabase
          .from('customers')
          .select('id, name')
          .eq('id', message.sender_id)
          .single()
        return { ...message, sender }
      }
      return { ...message, sender: null }
    }))

    const ticketWithMessages: TicketWithMessages = {
      ...ticket,
      messages: messagesWithSenders
    }

    return NextResponse.json({ ticket: ticketWithMessages })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  const { ticketId } = params
  try {
    // Get customer token from header
    const token = request.headers.get('x-customer-token')
    if (!token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    // Validate token and get customer details
    const { data: tokenData, error: tokenError } = await supabase
      .from('customer_access_tokens')
      .select('customer_id, email')
      .eq('token', token)
      .eq('status', 'active')
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // Validate ticket ownership
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, organization_id')
      .eq('id', ticketId)
      .eq('customer_id', tokenData.customer_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get message content
    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Create message
    const messageData: Database['public']['Tables']['messages']['Insert'] = {
      ticket_id: ticketId,
      organization_id: ticket.organization_id,
      content: content.trim(),
      sender_id: tokenData.customer_id,
      sender_type: 'customer',
      is_internal: false
    }

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Message creation failed:', insertError)
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Fetch the sender details separately
    const { data: sender } = await supabase
      .from('customers')
      .select('id, name')
      .eq('id', tokenData.customer_id)
      .single()

    const messageWithSender = {
      ...message,
      sender
    }

    // Update ticket activity
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        last_activity_at: new Date().toISOString(),
        status: 'open' // Reopen ticket if it was closed
      })
      .eq('id', ticketId)
      .eq('customer_id', tokenData.customer_id)

    if (updateError) {
      console.error('Ticket update failed:', updateError)
    }

    return NextResponse.json({ message: messageWithSender })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 