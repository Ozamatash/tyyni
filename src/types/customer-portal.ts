import { Database } from './supabase'

export type CustomerTicketMessage = Pick<
  Database['public']['Tables']['messages']['Row'],
  'id' | 'content' | 'created_at' | 'sender_type' | 'is_internal'
>

export type CustomerTicket = Pick<
  Database['public']['Tables']['tickets']['Row'],
  'id' | 'subject' | 'status' | 'priority' | 'created_at' | 'updated_at' | 'last_activity_at'
> & {
  messages: CustomerTicketMessage[]
}

export type VerifyTokenResponse = {
  verified: boolean
  tickets?: CustomerTicket[]
  error?: string
}

export type TokenVerificationPayload = {
  token: string
  email: string
}

export type CustomerPortalState = {
  isVerified: boolean
  isLoading: boolean
  error?: string
  tickets: CustomerTicket[]
  selectedTicketId?: string
} 