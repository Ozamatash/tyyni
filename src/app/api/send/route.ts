import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { getSupabaseOrgId } from '@/utils/organizations'
import { sendTicketUpdateNotification } from '@/utils/email'
import { nanoid } from 'nanoid'

interface SendEmailRequest {
  ticketId: string
  message?: string
  includeLatestMessages?: boolean
}

type MessageWithSender = Database['public']['Tables']['messages']['Row'] & {
  sender: Pick<Database['public']['Tables']['agent_profiles']['Row'], 'name'> | null
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function POST(request: Request) {
  try {
    const { orgId: clerkOrgId, userId } = await auth()
    
    if (!clerkOrgId || !userId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get request body
    const body: SendEmailRequest = await request.json()
    const { ticketId, message, includeLatestMessages = false } = body

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    // Get organization slug
    const { data: org } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', orgId)
      .single()

    if (!org?.slug) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get ticket and customer details
    const { data: ticket } = await supabase
      .from('tickets')
      .select(`
        id,
        subject,
        customer:customers (
          id,
          name,
          email
        )
      `)
      .eq('id', ticketId)
      .eq('organization_id', orgId)
      .single()

    if (!ticket || !ticket.customer) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Optionally get latest messages
    let fullMessage = message || ''
    if (includeLatestMessages) {
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          content,
          created_at,
          sender_type,
          is_internal,
          sender:agent_profiles(name)
        `)
        .eq('ticket_id', ticketId)
        .eq('organization_id', orgId)
        .eq('is_internal', false)
        .order('created_at', { ascending: false })
        .limit(3)
        .returns<MessageWithSender[]>()

      if (messages && messages.length > 0) {
        fullMessage += '\n\nRecent messages:\n'
        messages.reverse().forEach(msg => {
          const senderName = msg.sender_type === 'agent' ? msg.sender?.name : 'You'
          fullMessage += `\n${senderName}: ${msg.content}`
        })
      }
    }

    // Get or update customer's access token
    const { data: existingToken } = await supabase
      .from('customer_access_tokens')
      .select('token')
      .eq('customer_id', ticket.customer.id)
      .eq('email', ticket.customer.email)
      .eq('status', 'active')
      .single()

    let token: string
    if (existingToken) {
      // Update existing token's expiration
      token = existingToken.token
      const { error: updateError } = await supabase
        .from('customer_access_tokens')
        .update({
          expires_at: new Date(Date.now() + SEVEN_DAYS).toISOString()
        })
        .eq('token', token)
        .eq('status', 'active')

      if (updateError) {
        console.error('Error updating token expiration:', updateError)
        return NextResponse.json(
          { error: 'Error updating access token' },
          { status: 500 }
        )
      }
    } else {
      // Create new token if none exists
      token = nanoid(32)
      const { error: tokenError } = await supabase
        .from('customer_access_tokens')
        .insert({
          token,
          customer_id: ticket.customer.id,
          email: ticket.customer.email,
          status: 'active',
          expires_at: new Date(Date.now() + SEVEN_DAYS).toISOString()
        })

      if (tokenError) {
        console.error('Error creating access token:', tokenError)
        return NextResponse.json(
          { error: 'Error creating access token' },
          { status: 500 }
        )
      }
    }

    // Send email notification
    await sendTicketUpdateNotification({
      to: ticket.customer.email,
      orgSlug: org.slug,
      ticketId: ticket.id,
      subject: ticket.subject,
      customerName: ticket.customer.name,
      message: fullMessage.trim(),
      portalUrl: `${process.env.NEXT_PUBLIC_PORTAL_URL}/verify?token=${token}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email notification:', error)
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
} 