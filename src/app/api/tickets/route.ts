import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orgSlug = searchParams.get('org')
    
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
      return NextResponse.json({ error: 'Error creating customer' }, { status: 500 })
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
    
    // Create ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        customer:customers(name, email),
        assigned_to:agent_profiles(name)
      `)
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return NextResponse.json({ error: 'Error creating ticket' }, { status: 500 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orgSlug = searchParams.get('org')
  
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

  // Get tickets for organization
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      customer:customers(name, email),
      assigned_to:agent_profiles(name)
    `)
    .eq('organization_id', org.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }

  return NextResponse.json({ tickets })
} 