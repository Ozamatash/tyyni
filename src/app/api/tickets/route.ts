import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'
import { getSupabaseOrgId } from '@/utils/organizations'

export async function POST(req: Request) {
  try {
    const { orgId: clerkOrgId } = await auth()
    
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await req.json()

    // First, create or get a customer for this ticket
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        email: body.customerEmail,
        name: body.customerName,
        organization_id: orgId,
      })
      .select()
      .single()

    if (customerError) {
      console.error('Error creating/finding customer:', customerError)
      return NextResponse.json({ error: 'Error creating customer' }, { status: 500 })
    }
    
    // Create ticket with proper schema types
    const ticketData: Database['public']['Tables']['tickets']['Insert'] = {
      subject: body.subject,
      organization_id: orgId,
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
  try {
    const { orgId: clerkOrgId } = await auth()
    
    if (!clerkOrgId) {
      return NextResponse.json({ error: 'Organization access required' }, { status: 403 })
    }

    const orgId = await getSupabaseOrgId(clerkOrgId)
    if (!orgId) {
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
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 