import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

type Message = Database['public']['Tables']['messages']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']

async function getSenderDetails(message: Message) {
  if (message.sender_type === 'agent') {
    const { data: agent } = await supabase
      .from('agent_profiles')
      .select('id, name, email')
      .eq('id', message.sender_id)
      .single()
    return agent
  } else {
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('id', message.sender_id)
      .single()
    return customer
  }
}

async function verifyCustomerAccess(ticketId: string, customerId: string) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('customer_id')
    .eq('id', ticketId)
    .eq('customer_id', customerId)
    .single()

  return !error && ticket
}

async function getCustomerFromToken(token: string) {
  // First get the customer ID from the access token
  const { data: tokenData, error: tokenError } = await supabase
    .from('customer_access_tokens')
    .select('customer_id')
    .eq('token', token)
    .eq('status', 'active')
    .single()

  if (tokenError || !tokenData) {
    console.error('Token lookup error:', tokenError)
    return null
  }

  // Then get the customer details
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, organization_id')
    .eq('id', tokenData.customer_id)
    .single()

  if (customerError || !customer) {
    console.error('Customer lookup error:', customerError)
    return null
  }

  return customer
}

export async function GET(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const customerToken = cookieStore.get('customer_token')?.value

    if (!customerToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer
    const customer = await getCustomerFromToken(customerToken)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Verify ticket access
    const hasAccess = await verifyCustomerAccess(params.ticketId, customer.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', params.ticketId)
      .eq('is_internal', false)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Get sender details for each message
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => ({
        ...message,
        sender: await getSenderDetails(message)
      }))
    )

    return NextResponse.json({ messages: messagesWithSenders })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const cookieStore: ReadonlyRequestCookies = await cookies()
    const customerToken = cookieStore.get('customer_token')?.value

    if (!customerToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer
    const customer = await getCustomerFromToken(customerToken)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Verify ticket access
    const hasAccess = await verifyCustomerAccess(params.ticketId, customer.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id: params.ticketId,
        organization_id: customer.organization_id,
        content,
        sender_type: 'customer',
        sender_id: customer.id,
        is_internal: false
      })
      .select()
      .single()

    if (messageError) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update ticket last activity
    await supabase
      .from('tickets')
      .update({ 
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ticketId)

    return NextResponse.json({ 
      message: {
        ...message,
        sender: {
          id: customer.id
        }
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 