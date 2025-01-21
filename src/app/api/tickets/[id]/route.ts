import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'

export async function GET(
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

    // Fetch ticket with relations
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        assigned_agent:agent_profiles(*),
        messages:ticket_messages(*)
      `)
      .eq('id', id)
      .eq('organization_id', org.id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return new Response('Error fetching ticket', { status: 500 })
    }

    if (!ticket) {
      return new Response('Ticket not found', { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
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

    const body = await request.json()

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        status: body.status,
        priority: body.priority,
        assigned_to: body.assigned_to,
      })
      .eq('id', id)
      .eq('organization_id', org.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return new Response('Error updating ticket', { status: 500 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 