import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'

export async function POST(req: Request) {
  // Get the headers
  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type;
  
  // Organization Events
  if (eventType === 'organization.created') {
    const org = evt.data
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        clerk_id: org.id,
        name: org.name,
        support_email: `support@${org.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`, // Default support email
        created_at: new Date(org.created_at).toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating organization:', error)
      return new Response('Error creating organization', { status: 500 })
    }
  }

  if (eventType === 'organization.updated') {
    const org = evt.data
    
    // Get the organization from Supabase
    const { data: existingOrg, error: findError } = await supabase
      .from('organizations')
      .select()
      .eq('clerk_id', org.id)
      .single()

    if (findError || !existingOrg) {
      console.error('Error finding organization:', findError)
      return new Response('Error finding organization', { status: 500 })
    }

    // Update organization details
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        name: org.name,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', org.id)

    if (updateError) {
      console.error('Error updating organization:', updateError)
      return new Response('Error updating organization', { status: 500 })
    }
  }

  if (eventType === 'organization.deleted') {
    const org = evt.data
    
    // Delete organization and all related data (cascade delete should handle related records)
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('clerk_id', org.id)

    if (deleteError) {
      console.error('Error deleting organization:', deleteError)
      return new Response('Error deleting organization', { status: 500 })
    }
  }

  // Organization Membership Events
  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data, role } = evt.data
    
    // Get the organization from Supabase
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select()
      .eq('clerk_id', organization.id)
      .single()

    if (orgError || !org) {
      console.error('Error finding organization:', orgError)
      return new Response('Error finding organization', { status: 500 })
    }

    // Create or update the agent profile
    const { error: agentError } = await supabase
      .from('agent_profiles')
      .upsert({
        clerk_user_id: public_user_data.user_id,
        organization_id: org.id,
        name: public_user_data.first_name 
          ? `${public_user_data.first_name} ${public_user_data.last_name || ''}`
          : public_user_data.identifier || `User ${public_user_data.user_id.split('_')[1]}`,
        email: public_user_data.identifier,
        role: role === 'org:admin' ? 'admin' : 'agent',
        status: 'online',
      })

    if (agentError) {
      console.error('Error creating agent profile:', agentError)
      return new Response('Error creating agent profile', { status: 500 })
    }
  }

  if (eventType === 'organizationMembership.updated') {
    const { organization, public_user_data, role } = evt.data
    
    // Get the organization from Supabase
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select()
      .eq('clerk_id', organization.id)
      .single()

    if (orgError || !org) {
      console.error('Error finding organization:', orgError)
      return new Response('Error finding organization', { status: 500 })
    }

    // Update the agent profile role
    const { error: updateError } = await supabase
      .from('agent_profiles')
      .update({
        role: role === 'org:admin' ? 'admin' : 'agent',
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', public_user_data.user_id)
      .eq('organization_id', org.id)

    if (updateError) {
      console.error('Error updating agent profile:', updateError)
      return new Response('Error updating agent profile', { status: 500 })
    }
  }

  if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data
    
    // Get the organization from Supabase
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select()
      .eq('clerk_id', organization.id)
      .single()

    if (orgError || !org) {
      console.error('Error finding organization:', orgError)
      return new Response('Error finding organization', { status: 500 })
    }

    // Delete the agent profile
    const { error: deleteError } = await supabase
      .from('agent_profiles')
      .delete()
      .eq('clerk_user_id', public_user_data.user_id)
      .eq('organization_id', org.id)

    if (deleteError) {
      console.error('Error deleting agent profile:', deleteError)
      return new Response('Error deleting agent profile', { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
} 