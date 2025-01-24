import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    // First get the ticket to verify organization_id
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('organization_id, customer_id')
      .eq('id', params.ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', params.ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // First get the ticket to get organization_id and customer_id
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('organization_id, customer_id')
      .eq('id', params.ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: params.ticketId,
        organization_id: ticket.organization_id,
        content,
        sender_type: 'customer',
        sender_id: ticket.customer_id,
        is_internal: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update ticket last activity
    await supabase
      .from('tickets')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', params.ticketId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 