export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string | null
          timestamp: string | null
          trip_id: string
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          timestamp?: string | null
          trip_id: string
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          timestamp?: string | null
          trip_id?: string
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      scheduler_proposals: {
        Row: {
          client_name: string | null
          created_at: string
          end_time: string | null
          id: string
          reason: string | null
          score: number
          start_time: string | null
          status: string
          suggested_driver_id: string | null
          suggested_vehicle_id: string | null
          trip_id: string | null
          trip_name: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          end_time?: string | null
          id: string
          reason?: string | null
          score?: number
          start_time?: string | null
          status?: string
          suggested_driver_id?: string | null
          suggested_vehicle_id?: string | null
          trip_id?: string | null
          trip_name?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          score?: number
          start_time?: string | null
          status?: string
          suggested_driver_id?: string | null
          suggested_vehicle_id?: string | null
          trip_id?: string | null
          trip_name?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          client_id: string | null
          client_name: string | null
          created_at: string
          end_stop_id: string | null
          end_stop_name: string | null
          end_time: string | null
          id: string
          is_recurring: boolean
          is_return: boolean
          notes: string | null
          passengers: number
          recurrence_pattern: string | null
          start_stop_id: string | null
          start_stop_name: string | null
          start_time: string | null
          status: string
          updated_at: string
          vehicle_category: string | null
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          end_stop_id?: string | null
          end_stop_name?: string | null
          end_time?: string | null
          id: string
          is_recurring?: boolean
          is_return?: boolean
          notes?: string | null
          passengers?: number
          recurrence_pattern?: string | null
          start_stop_id?: string | null
          start_stop_name?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_category?: string | null
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          end_stop_id?: string | null
          end_stop_name?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean
          is_return?: boolean
          notes?: string | null
          passengers?: number
          recurrence_pattern?: string | null
          start_stop_id?: string | null
          start_stop_name?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          vehicle_category?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
