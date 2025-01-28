import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, support_email')

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ organizations: data })
  } catch (error) {
    console.error('Error in organizations route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 