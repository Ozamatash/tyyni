import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import { nanoid } from 'nanoid'
import { analyzeNewTicket } from '@/services/ai/ticket-processor'

interface CreateTicketRequest {
  email: string
  name: string
  subject: string
  message: string
  organizationId: string
}

export async function POST(req: Request) {
  try {
    console.log('Starting ticket creation process...')
    const { email, name, subject, message, organizationId }: CreateTicketRequest = await req.json()
    console.log('Received request data:', { email, name, subject, organizationId })

    // Get base URL from the request
    const url = new URL(req.url)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`

    // Validate input
    if (!email || !name || !subject || !message || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate organization exists
    console.log('Validating organization:', organizationId)
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      console.error('Organization validation error:', orgError)
      return NextResponse.json(
        { error: 'Invalid organization' },
        { status: 400 }
      )
    }

    // Create or use existing customer
    console.log('Creating/updating customer for:', email)
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          email,
          name,
          organization_id: organizationId
        },
        { onConflict: 'organization_id,email' }
      )
      .select()
      .single()

    if (customerError) {
      console.error('Customer creation error:', customerError)
      return NextResponse.json(
        { error: 'Error creating customer' },
        { status: 500 }
      )
    }

    // Call AI analysis BEFORE creating the ticket (internal only)
    console.log('Starting AI analysis...')
    let analysis
    try {
      analysis = await analyzeNewTicket(subject, message, customer.id, organizationId)
      console.log('AI analysis completed:', analysis)
    } catch (aiError) {
      console.error('AI analysis failed:', aiError)
      // Fallback values if AI fails
      analysis = {
        priority: 3,
        agent_id: '',
        reason: 'Automatic analysis unavailable'
      }
    }

    // Create ticket with AI analysis results (internal fields)
    console.log('Creating ticket with analysis:', analysis)
    
    // Map priority number to string value
    let priorityString: 'urgent' | 'high' | 'normal' | 'low'
    if (analysis.priority <= 2) {
      priorityString = 'urgent'
    } else if (analysis.priority === 3) {
      priorityString = 'high'
    } else if (analysis.priority === 4) {
      priorityString = 'normal'
    } else {
      priorityString = 'low'
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        customer_id: customer.id,
        subject,
        organization_id: organizationId,
        auto_priority: analysis.priority,
        auto_assigned_agent_id: analysis.agent_id || null,
        assigned_to: analysis.agent_id || null,
        status: 'open',
        priority: priorityString,
        metadata: {
          ai_analysis: {
            reason: analysis.reason,
            timestamp: new Date().toISOString()
          }
        }
      })
      .select('id')
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return NextResponse.json(
        { error: 'Error creating ticket' },
        { status: 500 }
      )
    }

    // Create initial message
    console.log('Creating initial message for ticket:', ticket.id)
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        ticket_id: ticket.id,
        sender_type: 'customer',
        sender_id: customer.id,
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

    // Update agent workload if assigned (internal operation)
    if (analysis.agent_id) {
      try {
        console.log('Updating agent workload for:', analysis.agent_id)
        const { error: updateError } = await supabase
          .rpc('increment_agent_ticket_count', {
            agent_id: analysis.agent_id
          })

        if (updateError) {
          // Log the error but continue with ticket creation
          console.warn('Non-critical error updating agent ticket count:', updateError)
        }
      } catch (workloadError) {
        // Log the error but continue with ticket creation
        console.warn('Non-critical error updating agent workload:', workloadError)
      }
    }

    // Generate and store access token
    console.log('Generating access token...')
    const token = nanoid(32)
    const { error: tokenError } = await supabase
      .from('customer_access_tokens')
      .insert({
        token,
        customer_id: customer.id,
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
    console.log('Sending notification email...')
    let emailSent = false
    try {
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
        const errorText = await emailResponse.text()
        console.error('Email sending error response:', errorText)
        // Don't return error response, just log it and continue
        console.warn('Failed to send email notification, but ticket was created successfully')
      } else {
        emailSent = true
      }
    } catch (emailError) {
      // Log the error but don't fail the ticket creation
      console.error('Error sending email notification:', emailError)
      console.warn('Failed to send email notification, but ticket was created successfully')
    }

    console.log('Ticket creation completed successfully')
    // Return only what the customer needs to know
    return NextResponse.json({
      success: true,
      token,
      message: `Your ticket has been created with ${org.name} support team. ${!emailSent ? 'However, there was an issue sending the email notification.' : ''}`
    })
  } catch (error) {
    // Log the full error details
    console.error('Detailed error in create ticket route:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 