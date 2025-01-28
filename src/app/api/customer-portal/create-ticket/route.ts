import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'

interface CreateTicketRequest {
  email: string
  name: string
  subject: string
  message: string
  organizationId: string
}

export async function POST(req: Request) {
  try {
    const { email, name, subject, message, organizationId }: CreateTicketRequest = await req.json()

    // Get base URL from the request
    const url = new URL(req.url)
    const baseUrl = `${url.protocol}//${url.host}`

    // Validate input
    if (!email || !name || !subject || !message || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate organization exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      console.error('Organization validation error:', orgError)
      return NextResponse.json(
        { error: 'Invalid organization' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select()
      .eq('email', email)
      .eq('organization_id', organizationId)
      .single()

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('Customer lookup error:', customerError)
      return NextResponse.json(
        { error: 'Error checking customer' },
        { status: 500 }
      )
    }

    // Create or use existing customer
    let customerId = customer?.id
    if (!customerId) {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          email,
          name,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Customer creation error:', createError)
        return NextResponse.json(
          { error: 'Error creating customer' },
          { status: 500 }
        )
      }
      customerId = newCustomer.id
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        customer_id: customerId,
        subject,
        status: 'open',
        priority: 'normal',
        organization_id: organizationId
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return NextResponse.json(
        { error: 'Error creating ticket' },
        { status: 500 }
      )
    }

    // Create initial message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id: ticket.id,
        sender_type: 'customer',
        sender_id: customerId,
        content: message,
        organization_id: organizationId,
        is_internal: false
      })

    if (messageError) {
      console.error('Message creation error:', messageError)
      return NextResponse.json(
        { error: 'Error creating message' },
        { status: 500 }
      )
    }

    // Generate and store access token
    const token = nanoid(32)
    const { error: tokenError } = await supabase
      .from('customer_access_tokens')
      .insert({
        token,
        customer_id: customerId,
        email,
        status: 'active',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (tokenError) {
      console.error('Token creation error:', tokenError)
      return NextResponse.json(
        { error: 'Error creating access token' },
        { status: 500 }
      )
    }

    // Send initial access email
    const emailResponse = await fetch(`${baseUrl}/api/customer-portal/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticketId: ticket.id,
        email,
        name,
        subject,
        token
      })
    })

    if (!emailResponse.ok) {
      console.error('Email sending error:', await emailResponse.text())
      return NextResponse.json(
        { error: 'Failed to send access email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Error in create ticket route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 