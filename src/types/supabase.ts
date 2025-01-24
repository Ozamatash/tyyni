export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_profiles: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          organization_id: string
          role: string
          settings: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          organization_id: string
          role: string
          settings?: Json | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string
          role?: string
          settings?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_access_tokens: {
        Row: {
          created_at: string | null
          customer_id: string
          email: string
          expires_at: string
          last_used_at: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["token_status"]
          token: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email: string
          expires_at: string
          last_used_at?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["token_status"]
          token: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email?: string
          expires_at?: string
          last_used_at?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["token_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_access_tokens_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_field_values: {
        Row: {
          created_at: string | null
          customer_id: string
          field_id: string
          id: string
          organization_id: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          field_id: string
          id?: string
          organization_id: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          field_id?: string
          id?: string
          organization_id?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_field_values_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "customer_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_field_values_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_fields: {
        Row: {
          created_at: string | null
          field_name: string
          field_type: Database["public"]["Enums"]["field_type"]
          id: string
          is_required: boolean
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          field_type: Database["public"]["Enums"]["field_type"]
          id?: string
          is_required?: boolean
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_required?: boolean
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_fields_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_accounts: {
        Row: {
          created_at: string | null
          email_address: string
          id: string
          imap_settings: Json
          is_active: boolean
          organization_id: string
          smtp_settings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_address: string
          id?: string
          imap_settings: Json
          is_active?: boolean
          organization_id: string
          smtp_settings: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_address?: string
          id?: string
          imap_settings?: Json
          is_active?: boolean
          organization_id?: string
          smtp_settings?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      macros: {
        Row: {
          body: string
          created_at: string | null
          created_by: string
          id: string
          metadata: Json | null
          organization_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by: string
          id?: string
          metadata?: Json | null
          organization_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "macros_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "macros_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          email_message_id: string | null
          id: string
          is_internal: boolean
          metadata: Json | null
          organization_id: string
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          email_message_id?: string | null
          id?: string
          is_internal?: boolean
          metadata?: Json | null
          organization_id: string
          sender_id: string
          sender_type: Database["public"]["Enums"]["sender_type"]
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          email_message_id?: string | null
          id?: string
          is_internal?: boolean
          metadata?: Json | null
          organization_id?: string
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["sender_type"]
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          clerk_id: string
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          support_email: string
          updated_at: string | null
        }
        Insert: {
          clerk_id: string
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          support_email: string
          updated_at?: string | null
        }
        Update: {
          clerk_id?: string
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          support_email?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          customer_id: string
          id: string
          last_activity_at: string | null
          metadata: Json | null
          organization_id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          organization_id: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      debug_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_customer_token: {
        Args: {
          token: string
        }
        Returns: undefined
      }
    }
    Enums: {
      field_type:
        | "text"
        | "number"
        | "boolean"
        | "date"
        | "select"
        | "multiselect"
      sender_type: "agent" | "customer" | "system"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status: "open" | "pending" | "solved" | "closed"
      token_status: "active" | "expired" | "revoked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
