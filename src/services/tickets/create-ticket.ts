import { supabase } from '@/utils/supabase/server'
import type { Database } from '@/types/supabase'

type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

export async function createTicket(
  ticketData: Omit<TicketInsert, 'id' | 'created_at' | 'updated_at'>,
  initialMessage: Omit<MessageInsert, 'id' | 'created_at' | 'ticket_id'>
) {
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      ...ticketData,
      status: 'open',
      priority: 'normal', // Default priority, will be updated by AI
      last_activity_at: new Date().toISOString()
    })
    .select()
    .single()

  if (ticketError || !ticket) {
    console.error('Error creating ticket:', ticketError)
    throw ticketError
  }

  // Create initial message
  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      ...initialMessage,
      ticket_id: ticket.id
    })

  if (messageError) {
    console.error('Error creating initial message:', messageError)
    // Consider rolling back ticket creation here
    throw messageError
  }

  return ticket
} 