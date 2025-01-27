import { NextResponse } from 'next/server'
import type { TokenVerificationPayload, VerifyTokenResponse } from '@/types/customer-portal'
import { supabase } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { token, email }: TokenVerificationPayload = await request.json()
    
    if (!token || !email) {
      return NextResponse.json<VerifyTokenResponse>({
        verified: false,
        error: 'Token and email are required'
      }, { status: 400 })
    }

    // Verify token exists and is valid
    const { data: tokenData, error: tokenError } = await supabase
      .from('customer_access_tokens')
      .select('customer_id, status, expires_at')
      .eq('token', token)
      .eq('email', email)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json<VerifyTokenResponse>({
        verified: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    if (tokenData.status !== 'active') {
      return NextResponse.json<VerifyTokenResponse>({
        verified: false,
        error: 'Token is expired or revoked'
      }, { status: 401 })
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      // Update token status to expired
      await supabase
        .from('customer_access_tokens')
        .update({ status: 'expired' })
        .eq('token', token)

      return NextResponse.json<VerifyTokenResponse>({
        verified: false,
        error: 'Token has expired'
      }, { status: 401 })
    }

    // Get customer's organization ID
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('organization_id')
      .eq('id', tokenData.customer_id)
      .single()

    if (customerError || !customer) {
      console.error('Error fetching customer:', customerError)
      return NextResponse.json<VerifyTokenResponse>({
        verified: false,
        error: 'Customer not found'
      }, { status: 404 })
    }

    // Fetch customer's tickets with their messages
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id,
        subject,
        status,
        priority,
        created_at,
        updated_at,
        last_activity_at,
        messages (
          id,
          content,
          created_at,
          sender_type,
          is_internal
        )
      `)
      .eq('customer_id', tokenData.customer_id)
      .eq('organization_id', customer.organization_id)
      .order('created_at', { ascending: false })
      .limit(10) // Limit to 10 most recent tickets initially

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json<VerifyTokenResponse>({
        verified: false,
        error: 'Failed to fetch tickets'
      }, { status: 500 })
    }

    // Update token last used timestamp
    await supabase
      .from('customer_access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token', token)

    // Create response with cookies
    const response = NextResponse.json<VerifyTokenResponse>({
      verified: true,
      tickets: tickets
    })

    // Set cookies with appropriate options
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(tokenData.expires_at)
    })

    response.cookies.set('customer_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(tokenData.expires_at)
    })

    return response

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json<VerifyTokenResponse>({
      verified: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 