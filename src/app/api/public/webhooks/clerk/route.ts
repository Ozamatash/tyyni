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

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data
    if (!public_user_data?.identifier) {
      return new Response('No user email found', { status: 400 })
    }

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
        clerk_user_id: evt.data.public_user_data.user_id,
        organization_id: org.id,
        name: public_user_data.first_name 
          ? `${public_user_data.first_name} ${public_user_data.last_name || ''}`
          : public_user_data.identifier,
        email: public_user_data.identifier,
        role: evt.data.role === 'org:admin' ? 'admin' : 'agent',
        status: 'online',
      })

    if (agentError) {
      console.error('Error creating agent profile:', agentError)
      return new Response('Error creating agent profile', { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
} 