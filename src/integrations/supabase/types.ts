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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      overtime_requests: {
        Row: {
          approver1_approved_at: string | null
          approver1_name: string | null
          approver1_status: Database["public"]["Enums"]["overtime_status"] | null
          approver2_approved_at: string | null
          approver2_name: string | null
          approver2_status: Database["public"]["Enums"]["overtime_status"] | null
          category: string
          category_key: string
          created_at: string | null
          date: string
          duration: number
          end_time: string
          id: number
          name: string
          nik: string
          reason: string
          start_time: string
          status: Database["public"]["Enums"]["overtime_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approver1_approved_at?: string | null
          approver1_name?: string | null
          approver1_status?: Database["public"]["Enums"]["overtime_status"] | null
          approver2_approved_at?: string | null
          approver2_name?: string | null
          approver2_status?: Database["public"]["Enums"]["overtime_status"] | null
          category: string
          category_key: string
          created_at?: string | null
          date: string
          duration: number
          end_time: string
          id?: number
          name: string
          nik: string
          reason: string
          start_time: string
          status?: Database["public"]["Enums"]["overtime_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approver1_approved_at?: string | null
          approver1_name?: string | null
          approver1_status?: Database["public"]["Enums"]["overtime_status"] | null
          approver2_approved_at?: string | null
          approver2_name?: string | null
          approver2_status?: Database["public"]["Enums"]["overtime_status"] | null
          category?: string
          category_key?: string
          created_at?: string | null
          date?: string
          duration?: number
          end_time?: string
          id?: number
          name?: string
          nik?: string
          reason?: string
          start_time?: string
          status?: Database["public"]["Enums"]["overtime_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          nik: string
          pickup_point: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          nik: string
          pickup_point?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          nik?: string
          pickup_point?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approver1_nik: string | null
          approver2_nik: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approver1_nik?: string | null
          approver2_nik?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approver1_nik?: string | null
          approver2_nik?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      overtime_requests_with_details: {
        Row: {
          approver1_approved_at: string | null
          approver1_name: string | null
          approver1_nik: string | null
          approver1_status: Database["public"]["Enums"]["overtime_status"] | null
          approver2_approved_at: string | null
          approver2_name: string | null
          approver2_nik: string | null
          approver2_status: Database["public"]["Enums"]["overtime_status"] | null
          category: string
          category_key: string
          created_at: string | null
          date: string
          duration: number
          end_time: string
          id: number
          name: string
          nik: string
          pickup_point: string | null
          reason: string
          start_time: string
          status: Database["public"]["Enums"]["overtime_status"] | null
          updated_at: string | null
          user_id: string
          user_role: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_overtime_statistics: {
        Args: {
          _end_date: string
          _start_date: string
        }
        Returns: {
          approved_requests: number
          pending_requests: number
          rejected_requests: number
          total_hours: number
          total_requests: number
        }
      }
      get_pending_requests_for_approver: {
        Args: {
          _approver_nik: string
        }
        Returns: {
          approver1_approved_at: string | null
          approver1_name: string | null
          approver1_status: Database["public"]["Enums"]["overtime_status"] | null
          approver2_approved_at: string | null
          approver2_name: string | null
          approver2_status: Database["public"]["Enums"]["overtime_status"] | null
          category: string
          category_key: string
          created_at: string | null
          date: string
          duration: number
          end_time: string
          id: number
          name: string
          nik: string
          reason: string
          start_time: string
          status: Database["public"]["Enums"]["overtime_status"] | null
          user_id: string
        }
      }
      get_user_overtime_report: {
        Args: {
          _end_date: string
          _start_date: string
          _user_nik: string
        }
        Returns: {
          approved_requests: number
          name: string
          nik: string
          pending_requests: number
          rejected_requests: number
          total_hours: number
          total_requests: number
        }
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_overtime_status: {
        Args: {
          _approver_name: string
          _approver_role: Database["public"]["Enums"]["app_role"]
          _request_id: number
          _status: Database["public"]["Enums"]["overtime_status"]
        }
        Returns: boolean
      }
      validate_overtime_request: {
        Args: {
          _category_key: string
          _date: string
          _end_time: string
          _start_time: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "employee" | "approver1" | "approver2" | "admin"
      overtime_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["employee", "approver1", "approver2", "admin"],
      overtime_status: ["pending", "approved", "rejected"],
    },
  },
} as const
