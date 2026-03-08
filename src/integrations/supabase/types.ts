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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          discount_amount: number | null
          dropoff_stop_id: string | null
          id: string
          is_paid: boolean
          passenger_email: string
          passenger_name: string
          passenger_notes: string | null
          passenger_phone: string
          payment_screenshot_url: string | null
          pickup_stop_id: string | null
          promo_code: string | null
          route_id: string | null
          seats: number[]
          status: string
          total_price: number
          trip_instance_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          dropoff_stop_id?: string | null
          id?: string
          is_paid?: boolean
          passenger_email: string
          passenger_name: string
          passenger_notes?: string | null
          passenger_phone: string
          payment_screenshot_url?: string | null
          pickup_stop_id?: string | null
          promo_code?: string | null
          route_id?: string | null
          seats: number[]
          status?: string
          total_price: number
          trip_instance_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          dropoff_stop_id?: string | null
          id?: string
          is_paid?: boolean
          passenger_email?: string
          passenger_name?: string
          passenger_notes?: string | null
          passenger_phone?: string
          payment_screenshot_url?: string | null
          pickup_stop_id?: string | null
          promo_code?: string | null
          route_id?: string | null
          seats?: number[]
          status?: string
          total_price?: number
          trip_instance_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_dropoff_stop_id_fkey"
            columns: ["dropoff_stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pickup_stop_id_fkey"
            columns: ["pickup_stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_instance_id_fkey"
            columns: ["trip_instance_id"]
            isOneToOne: false
            referencedRelation: "trip_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      private_trip_requests: {
        Row: {
          created_at: string
          dropoff_location: string
          id: string
          name: string
          notes: string | null
          number_of_passengers: number
          phone: string
          pickup_location: string
          preferred_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dropoff_location: string
          id?: string
          name: string
          notes?: string | null
          number_of_passengers?: number
          phone: string
          pickup_location: string
          preferred_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dropoff_location?: string
          id?: string
          name?: string
          notes?: string | null
          number_of_passengers?: number
          phone?: string
          pickup_location?: string
          preferred_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      route_template_stops: {
        Row: {
          created_at: string
          id: string
          route_template_id: string
          sequence_order: number
          stop_id: string
          stop_role: Database["public"]["Enums"]["stop_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          route_template_id: string
          sequence_order: number
          stop_id: string
          stop_role?: Database["public"]["Enums"]["stop_role"]
        }
        Update: {
          created_at?: string
          id?: string
          route_template_id?: string
          sequence_order?: number
          stop_id?: string
          stop_role?: Database["public"]["Enums"]["stop_role"]
        }
        Relationships: [
          {
            foreignKeyName: "route_template_stops_route_template_id_fkey"
            columns: ["route_template_id"]
            isOneToOne: false
            referencedRelation: "route_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_template_stops_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      route_templates: {
        Row: {
          created_at: string
          destination_region: string
          id: string
          is_active: boolean
          name: string
          origin_region: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_region: string
          id?: string
          is_active?: boolean
          name: string
          origin_region: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_region?: string
          id?: string
          is_active?: boolean
          name?: string
          origin_region?: string
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          arrival_time: string
          available_seats: number
          created_at: string
          date: string
          departure_time: string
          destination: string
          driver_name: string
          id: string
          origin: string
          price: number
          total_seats: number
          updated_at: string
          van_number: string
        }
        Insert: {
          arrival_time: string
          available_seats?: number
          created_at?: string
          date: string
          departure_time: string
          destination: string
          driver_name: string
          id?: string
          origin: string
          price: number
          total_seats?: number
          updated_at?: string
          van_number: string
        }
        Update: {
          arrival_time?: string
          available_seats?: number
          created_at?: string
          date?: string
          departure_time?: string
          destination?: string
          driver_name?: string
          id?: string
          origin?: string
          price?: number
          total_seats?: number
          updated_at?: string
          van_number?: string
        }
        Relationships: []
      }
      schedule_stop_times: {
        Row: {
          arrival_time: string
          created_at: string
          departure_time: string | null
          id: string
          schedule_id: string
          sequence_order: number
          stop_id: string
        }
        Insert: {
          arrival_time: string
          created_at?: string
          departure_time?: string | null
          id?: string
          schedule_id: string
          sequence_order: number
          stop_id: string
        }
        Update: {
          arrival_time?: string
          created_at?: string
          departure_time?: string | null
          id?: string
          schedule_id?: string
          sequence_order?: number
          stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_stop_times_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "trip_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_stop_times_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      stops: {
        Row: {
          address: string | null
          city: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string
          region: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en: string
          region: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_instances: {
        Row: {
          available_seats: number
          created_at: string
          id: string
          schedule_id: string
          status: string
          total_seats: number
          trip_date: string
          updated_at: string
        }
        Insert: {
          available_seats: number
          created_at?: string
          id?: string
          schedule_id: string
          status?: string
          total_seats: number
          trip_date: string
          updated_at?: string
        }
        Update: {
          available_seats?: number
          created_at?: string
          id?: string
          schedule_id?: string
          status?: string
          total_seats?: number
          trip_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_instances_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "trip_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_schedules: {
        Row: {
          created_at: string
          daily_repeats: number
          end_date: string
          id: string
          is_active: boolean
          price: number
          recurrence_type: string
          route_template_id: string
          seats_per_vehicle: number
          start_date: string
          title: string
          updated_at: string
          van_type: string
          vehicle_count: number
          weekdays: number[] | null
        }
        Insert: {
          created_at?: string
          daily_repeats?: number
          end_date: string
          id?: string
          is_active?: boolean
          price?: number
          recurrence_type?: string
          route_template_id: string
          seats_per_vehicle?: number
          start_date: string
          title: string
          updated_at?: string
          van_type?: string
          vehicle_count?: number
          weekdays?: number[] | null
        }
        Update: {
          created_at?: string
          daily_repeats?: number
          end_date?: string
          id?: string
          is_active?: boolean
          price?: number
          recurrence_type?: string
          route_template_id?: string
          seats_per_vehicle?: number
          start_date?: string
          title?: string
          updated_at?: string
          van_type?: string
          vehicle_count?: number
          weekdays?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_schedules_route_template_id_fkey"
            columns: ["route_template_id"]
            isOneToOne: false
            referencedRelation: "route_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      stop_role: "pickup" | "dropoff" | "both"
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
      app_role: ["admin", "user"],
      stop_role: ["pickup", "dropoff", "both"],
    },
  },
} as const
