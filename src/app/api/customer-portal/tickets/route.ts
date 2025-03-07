import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'
import { Database } from '@/types/supabase'
import { getOrgIdFromEmail } from '@/utils/organizations'
import { sendTicketNotification } from '@/utils/email'

type Customer = Database['public']['Tables']['customers']['Row']

export async function POST(req: Request) {
  try {
    const { email, name, subject, message, supportEmail } = await req.json()

    // Validate input
    if (!email || !name || !subject || !message || !supportEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get organization from support email
    const orgId = await getOrgIdFromEmail(supportEmail)
    if (!orgId) {
      return NextResponse.json(
        { error: 'Invalid support email' },
        { status: 404 }
      )
    }

    // Get organization slug for email
    const { data: org } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', orgId)
      .single()

    if (!org?.slug) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Start a transaction
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select()
      .eq('email', email)
      .eq('organization_id', orgId)
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
          organization_id: orgId
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
        organization_id: orgId
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
        organization_id: orgId,
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
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

    if (tokenError) {
      console.error('Error creating token:', tokenError)
      return NextResponse.json(
        { error: 'Error creating access token' },
        { status: 500 }
      )
    }

    // Send initial access email
    try {
      const portalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL}/verify?token=${token}`
      await sendTicketNotification({
        to: email,
        orgSlug: org.slug,
        ticketId: ticket.id,
        subject,
        customerName: name,
        portalUrl
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Since this is the initial access email, we should fail the request
      // Otherwise the customer won't get their access link
      await supabase
        .from('customer_access_tokens')
        .delete()
        .eq('token', token)
      
      return NextResponse.json(
        { error: 'Failed to send access email' },
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