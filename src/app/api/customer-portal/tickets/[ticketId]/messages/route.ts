import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

async function verifyCustomerAccess(ticketId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get('customer_token')?.value
  const email = cookieStore.get('customer_email')?.value

  if (!token || !email) {
    return false
  }

  // Verify token and get customer_id
  const { data: tokenData, error: tokenError } = await supabase
    .from('customer_access_tokens')
    .select('customer_id, status')
    .eq('token', token)
    .eq('email', email)
    .eq('status', 'active')
    .single()

  if (tokenError || !tokenData) {
    return false
  }

  // Verify ticket belongs to customer
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id')
    .eq('id', ticketId)
    .eq('customer_id', tokenData.customer_id)
    .single()

  return !ticketError && ticket
}

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    // Verify customer has access to this ticket
    const hasAccess = await verifyCustomerAccess(params.ticketId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    // Verify customer has access to this ticket
    const hasAccess = await verifyCustomerAccess(params.ticketId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Get customer_id from token
    const cookieStore = await cookies()
    const token = cookieStore.get('customer_token')?.value
    const email = cookieStore.get('customer_email')?.value

    const { data: tokenData } = await supabase
      .from('customer_access_tokens')
      .select('customer_id')
      .eq('token', token!)
      .eq('email', email!)
      .single()

    // Get ticket organization_id
    const { data: ticket } = await supabase
      .from('tickets')
      .select('organization_id')
      .eq('id', params.ticketId)
      .single()

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: params.ticketId,
        organization_id: ticket!.organization_id,
        content,
        sender_type: 'customer',
        sender_id: tokenData!.customer_id,
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