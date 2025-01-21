import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
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

    const body = await req.json()

    // First, create or get a customer for this ticket
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        email: body.customerEmail,
        name: body.customerName,
        organization_id: org.id,
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating/finding customer:', customerError)
      return new Response('Error creating customer', { status: 500 })
    }
    
    // Create ticket with proper schema types
    const ticketData = {
      subject: body.subject,
      organization_id: org.id,
      customer_id: customer.id,
      status: body.status,
      priority: body.priority,
      assigned_to: body.assignedTo || null,
      metadata: {}
    }
    
    // Create ticket with Supabase org ID
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return new Response('Error creating ticket', { status: 500 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clerkOrgId = searchParams.get('orgId')

    if (!clerkOrgId) {
      return new Response('Organization ID is required', { status: 400 })
    }

    // First get the organization's Supabase ID using the Clerk ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('clerk_id', clerkOrgId)
      .single()

    if (orgError) {
      console.error('Error finding organization:', orgError)
      return new Response('Error finding organization', { status: 500 })
    }

    // Now use the Supabase org ID to query tickets with relations
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:customers(*),
        assigned_agent:agent_profiles(*)
      `)
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error listing tickets:', error)
      return new Response('Error listing tickets', { status: 500 })
    }

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 