import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', params.ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { content } = await request.json()
    const supabase = createServerSupabaseClient()

    // First verify access to the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('customer_id, organization_id')
      .eq('id', params.ticketId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Insert the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        content,
        ticket_id: params.ticketId,
        organization_id: ticket.organization_id,
        sender_id: ticket.customer_id,
        sender_type: 'customer',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
} 