import { Database } from "@/types/supabase"

export type TicketStatus = Database['public']['Enums']['ticket_status']
export type TicketPriority = Database['public']['Enums']['ticket_priority']
export type SenderType = Database['public']['Enums']['sender_type']

export type Message = Database['public']['Tables']['messages']['Row'] & {
  sender: {
    id: string
    name: string
    email: string
  } | null
}

export type TicketData = Database['public']['Tables']['tickets']['Row'] & {
  customer: {
    name: string
    email: string
  }
  assigned_to: {
    id: string
    name: string
  } | null
}

export type Agent = {
  id: string
  name: string
} 