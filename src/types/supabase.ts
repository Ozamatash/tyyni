export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          clerk_id: string
          name: string
          support_email: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          name: string
          support_email: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          name?: string
          support_email?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      agent_profiles: {
        Row: {
          id: string
          clerk_user_id: string
          organization_id: string
          name: string
          email: string
          role: string
          status: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          organization_id: string
          name: string
          email: string
          role: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          organization_id?: string
          name?: string
          email?: string
          role?: string
          status?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customer_fields: {
        Row: {
          id: string
          organization_id: string
          field_name: string
          field_type: string
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          field_name: string
          field_type: string
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          field_name?: string
          field_type?: string
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customer_field_values: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          field_id: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          field_id: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          field_id?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          assigned_to: string | null
          subject: string
          status: string
          priority: string
          metadata: Json
          last_activity_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          assigned_to?: string | null
          subject: string
          status?: string
          priority?: string
          metadata?: Json
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          assigned_to?: string | null
          subject?: string
          status?: string
          priority?: string
          metadata?: Json
          last_activity_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      ticket_messages: {
        Row: {
          id: string
          organization_id: string
          ticket_id: string
          sender_type: string
          sender_id: string
          body: string
          is_internal: boolean
          email_message_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          ticket_id: string
          sender_type: string
          sender_id: string
          body: string
          is_internal?: boolean
          email_message_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          ticket_id?: string
          sender_type?: string
          sender_id?: string
          body?: string
          is_internal?: boolean
          email_message_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      macros: {
        Row: {
          id: string
          organization_id: string
          title: string
          body: string
          created_by: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          body: string
          created_by: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          body?: string
          created_by?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      email_accounts: {
        Row: {
          id: string
          organization_id: string
          email_address: string
          imap_settings: Json
          smtp_settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email_address: string
          imap_settings: Json
          smtp_settings: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email_address?: string
          imap_settings?: Json
          smtp_settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ticket_status: 'open' | 'pending' | 'solved' | 'closed'
      ticket_priority: 'low' | 'normal' | 'high' | 'urgent'
      sender_type: 'agent' | 'customer' | 'system'
      field_type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect'
    }
  }
} 