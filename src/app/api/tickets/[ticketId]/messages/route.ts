import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const orgSlug = searchParams.get('org')
    const context = searchParams.get('context') || 'agent'
    
    if (!orgSlug) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 })
    }

    // Get organization ID from slug
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Verify access based on context
    if (context === 'customer') {
      // For customer context, verify access token
      const token = request.headers.get('authorization')?.split(' ')[1]
      if (!token) {
        return NextResponse.json({ error: 'Access token required' }, { status: 401 })
      }

      const { data: accessToken } = await supabase
        .from('customer_access_tokens')
        .select('customer_id, status')
        .eq('token', token)
        .single()

      if (!accessToken || accessToken.status !== 'active') {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }

      // Verify ticket belongs to customer
      const { data: ticket } = await supabase
        .from('tickets')
        .select('id')
        .eq('id', params.ticketId)
        .eq('customer_id', accessToken.customer_id)
        .eq('organization_id', org.id)
        .single()

      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }
    }

    // Build the messages query
    let query = supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_type,
        is_internal,
        sender_id,
        metadata,
        sender:sender_id (
          name,
          email
        )
      `)
      .eq('ticket_id', params.ticketId)
      .eq('organization_id', org.id)
      .order('created_at')

    // For customer context, only show non-internal messages
    if (context === 'customer') {
      query = query.eq('is_internal', false)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const orgSlug = searchParams.get('org')
    const context = searchParams.get('context') || 'agent'
    
    if (!orgSlug) {
      return NextResponse.json({ error: 'Organization required' }, { status: 400 })
    }

    const body = await request.json()
    const { content, is_internal = false } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Get organization ID from slug
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let senderId: string
    let senderType: Database['public']['Enums']['sender_type']

    if (context === 'customer') {
      // For customer context, verify access token and use customer as sender
      const token = request.headers.get('authorization')?.split(' ')[1]
      if (!token) {
        return NextResponse.json({ error: 'Access token required' }, { status: 401 })
      }

      const { data: accessToken } = await supabase
        .from('customer_access_tokens')
        .select('customer_id, status')
        .eq('token', token)
        .single()

      if (!accessToken || accessToken.status !== 'active') {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
      }

      // Verify ticket belongs to customer
      const { data: ticket } = await supabase
        .from('tickets')
        .select('id')
        .eq('id', params.ticketId)
        .eq('customer_id', accessToken.customer_id)
        .eq('organization_id', org.id)
        .single()

      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }

      senderId = accessToken.customer_id
      senderType = 'customer'
    } else {
      // For agent context, get agent ID from query params
      const agentId = searchParams.get('agent')
      if (!agentId) {
        return NextResponse.json({ error: 'Agent ID required' }, { status: 400 })
      }

      // Verify agent belongs to organization
      const { data: agent } = await supabase
        .from('agent_profiles')
        .select('id')
        .eq('id', agentId)
        .eq('organization_id', org.id)
        .single()

      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }

      senderId = agentId
      senderType = 'agent'
    }

    // Create the message
    const messageData: MessageInsert = {
      ticket_id: params.ticketId,
      organization_id: org.id,
      content,
      sender_id: senderId,
      sender_type: senderType,
      is_internal: context === 'agent' && is_internal
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select(`
        id,
        content,
        created_at,
        sender_type,
        is_internal,
        sender_id,
        metadata,
        sender:sender_id (
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Update ticket last_activity_at
    await supabase
      .from('tickets')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', params.ticketId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 