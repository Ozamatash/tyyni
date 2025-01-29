import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { getSupabaseOrgId } from '@/utils/organizations'

// Enhanced type definitions
type Message = Database['public']['Tables']['messages']['Row']
type AgentProfile = Database['public']['Tables']['agent_profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

export type WithSender = Message & {
  sender: AgentProfile | Customer | null
}

export type MessageInsertParams = Pick<
  Database['public']['Tables']['messages']['Insert'],
  'content' | 'is_internal' | 'ticket_id'
>

export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { orgId: clerkOrgId } = await auth()
    
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get ticket ID from params
    const { ticketId } = await params

    // First get messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    // Then fetch senders in parallel
    const messagesWithSenders = await Promise.all(messages.map(async (message) => {
      if (message.sender_type === 'agent') {
        const { data: sender } = await supabase
          .from('agent_profiles')
          .select('*')
          .eq('id', message.sender_id)
          .eq('organization_id', orgId)
          .single();
        return { ...message, sender };
      } else if (message.sender_type === 'customer') {
        const { data: sender } = await supabase
          .from('customers')
          .select('*')
          .eq('id', message.sender_id)
          .eq('organization_id', orgId)
          .single();
        return { ...message, sender };
      }
      return { ...message, sender: null };
    }));

    return NextResponse.json({ messages: messagesWithSenders })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request, props: { params: Promise<{ ticketId: string }> }) {
  const params = await props.params;
  try {
    const { orgId: clerkOrgId, userId } = await auth()
    
    if (!clerkOrgId || !userId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body: MessageInsertParams = await request.json()
    const { content, is_internal = false } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Validate agent profile
    const { data: agentProfile, error: profileError } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('organization_id', orgId)
      .single()

    if (profileError || !agentProfile?.id) {
      console.error('Agent profile lookup failed:', profileError)
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 403 })
    }

    // Create message
    const messageData: Database['public']['Tables']['messages']['Insert'] = {
      ticket_id: params.ticketId,
      organization_id: orgId,
      content: content.trim(),
      sender_id: agentProfile.id,
      sender_type: 'agent',
      is_internal
    }

    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Message creation failed:', insertError)
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
    }

    // Fetch sender information separately
    const { data: sender } = await supabase
      .from('agent_profiles')
      .select('id, name')
      .eq('id', agentProfile.id)
      .single()

    const messageWithSender = {
      ...message,
      sender
    }

    // Update ticket activity
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        last_activity_at: new Date().toISOString(),
        status: 'open' // Ensure ticket remains open on new message
      })
      .eq('id', params.ticketId)
      .eq('organization_id', orgId)

    if (updateError) {
      console.error('Ticket update failed:', updateError)
    }

    return NextResponse.json({ message: messageWithSender })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
