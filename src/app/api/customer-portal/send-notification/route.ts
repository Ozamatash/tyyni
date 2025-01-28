import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { sendTicketNotification } from '@/utils/email'

interface SendNotificationRequest {
  ticketId: string
  email: string
  name: string
  subject: string
  token: string
}

export async function POST(req: Request) {
  try {
    const { ticketId, email, name, subject, token }: SendNotificationRequest = await req.json()

    // Validate input
    if (!ticketId || !email || !name || !subject || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get organization details
    const { data: ticket } = await supabase
      .from('tickets')
      .select('organization:organizations(name, slug)')
      .eq('id', ticketId)
      .single()

    if (!ticket?.organization) {
      return NextResponse.json(
        { error: 'Ticket or organization not found' },
        { status: 404 }
      )
    }

    // Generate portal URL
    const portalUrl = `${process.env.NEXT_PUBLIC_PORTAL_URL}/verify?token=${token}`

    // Send notification
    await sendTicketNotification({
      to: email,
      orgSlug: ticket.organization.slug,
      ticketId,
      subject,
      customerName: name,
      portalUrl
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
} 