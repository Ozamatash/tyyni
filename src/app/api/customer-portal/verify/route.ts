import { NextResponse } from 'next/server'
import type { TokenVerificationPayload, VerifyTokenResponse } from '@/types/customer-portal'
import { supabase } from '@/utils/supabase/server'

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
      .select('customer_id, status')
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

    // Fetch customer's tickets with their messages
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        messages (*)
      `)
      .eq('customer_id', tokenData.customer_id)
      .order('created_at', { ascending: false })

    if (ticketsError) {
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

    return NextResponse.json<VerifyTokenResponse>({
      verified: true,
      tickets: tickets
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json<VerifyTokenResponse>({
      verified: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 