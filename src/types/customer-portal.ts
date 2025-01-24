import { Database } from './supabase'

export type CustomerTicket = Database['public']['Tables']['tickets']['Row'] & {
  messages: Database['public']['Tables']['messages']['Row'][]
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