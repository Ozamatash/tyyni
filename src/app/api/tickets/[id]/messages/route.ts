import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params)
    const authData = await auth()
    const { userId, orgId: clerkOrgId } = authData
    if (!userId || !clerkOrgId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get Supabase organization ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_id', clerkOrgId)
      .single()

    if (orgError) {
      console.error('Error finding organization:', orgError)
      return new Response('Error finding organization', { status: 500 })
    }

    // Get agent profile
    const { data: agent, error: agentError } = await supabase
      .from('agent_profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (agentError) {
      console.error('Error finding agent:', agentError)
      return new Response('Error finding agent', { status: 500 })
    }

    const body = await request.json()

    // Create message
    const { data: message, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: id,
        body: body.body,
        is_internal: body.is_internal,
        sender_type: 'agent',
        sender_id: agent.id,
        organization_id: org.id,
      })
      .select(`
        *,
        sender:agent_profiles!ticket_messages_sender_id_fkey(*)
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return new Response('Error creating message', { status: 500 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 