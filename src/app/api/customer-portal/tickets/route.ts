import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'
import { Database } from '@/types/supabase'

type Customer = Database['public']['Tables']['customers']['Row']

export async function POST(req: Request) {
  try {
    const { email, name, subject, message } = await req.json()

    // Validate input
    if (!email || !name || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Start a transaction
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select()
      .eq('email', email)
      .single()

    if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching customer:', customerError)
      return NextResponse.json(
        { error: 'Error processing request' },
        { status: 500 }
      )
    }

    // If customer doesn't exist, create them
    let customerId = customer?.id
    if (!customerId) {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          email,
          name,
          // For testing, we'll use a hardcoded organization_id
          organization_id: 'd6707a28-4f14-4ab9-bbb1-87dbe819ee0a'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating customer:', createError)
        return NextResponse.json(
          { error: 'Error creating customer' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Create the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        customer_id: customerId,
        subject,
        status: 'open',
        priority: 'normal',
        organization_id: 'd6707a28-4f14-4ab9-bbb1-87dbe819ee0a'
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json(
        { error: 'Error creating ticket' },
        { status: 500 }
      )
    }

    // Create the initial message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id: ticket.id,
        sender_type: 'customer',
        sender_id: customerId,
        content: message,
        organization_id: 'd6707a28-4f14-4ab9-bbb1-87dbe819ee0a',
        is_internal: false
      })

    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json(
        { error: 'Error creating message' },
        { status: 500 }
      )
    }

    // Generate and store access token
    const token = nanoid(32) // Generate a secure token
    const { error: tokenError } = await supabase
      .from('customer_access_tokens')
      .insert({
        token,
        customer_id: customerId,
        email,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })

    if (tokenError) {
      console.error('Error creating token:', tokenError)
      return NextResponse.json(
        { error: 'Error creating access token' },
        { status: 500 }
      )
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 