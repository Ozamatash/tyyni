import type { Database } from '@/types/supabase'

export type TicketAnalysis = {
  priority: number
  agent_id: string
  reason: string
}

export type AgentSuggestion = {
  suggestions: string[]
  context: string
}

export type TicketContext = {
  ticket: Database['public']['Tables']['tickets']['Row']
  messages: Database['public']['Tables']['messages']['Row'][]
  customer: Database['public']['Tables']['customers']['Row']
}

export type AgentContext = {
  agent: Database['public']['Tables']['agent_profiles']['Row']
  expertise_tags: string[]
  current_open_tickets: number
} 