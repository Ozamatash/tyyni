import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/utils/supabase/server'

export async function GET(request: Request) {
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

    // Fetch agents for this organization
    const { data: agents, error } = await supabase
      .from('agent_profiles')
      .select('*')
      .eq('organization_id', org.id)
      .order('name')

    if (error) {
      console.error('Error fetching agents:', error)
      return new Response('Error fetching agents', { status: 500 })
    }

    return NextResponse.json(agents)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 