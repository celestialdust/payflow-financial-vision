export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      company_metrics: {
        Row: {
          average_days_to_pay: number | null
          client_name: string | null
          id: string
          late_invoices_count: number | null
          late_invoices_percentage: number | null
          monthly_data: Json | null
          outstanding_amount: number | null
          outstanding_invoices: number | null
          payment_status_breakdown: Json | null
          total_invoiced: number | null
          total_invoices: number | null
          total_paid: number | null
        }
        Insert: {
          average_days_to_pay?: number | null
          client_name?: string | null
          id?: string
          late_invoices_count?: number | null
          late_invoices_percentage?: number | null
          monthly_data?: Json | null
          outstanding_amount?: number | null
          outstanding_invoices?: number | null
          payment_status_breakdown?: Json | null
          total_invoiced?: number | null
          total_invoices?: number | null
          total_paid?: number | null
        }
        Update: {
          average_days_to_pay?: number | null
          client_name?: string | null
          id?: string
          late_invoices_count?: number | null
          late_invoices_percentage?: number | null
          monthly_data?: Json | null
          outstanding_amount?: number | null
          outstanding_invoices?: number | null
          payment_status_breakdown?: Json | null
          total_invoiced?: number | null
          total_invoices?: number | null
          total_paid?: number | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          "Amount Due": number | null
          "Client Name": string | null
          "Date Invoiced": string | null
          "Date Paid": string | null
          id: string
          "Invoice Amount": number | null
          "Invoice Month": string | null
          "Invoice Reference": string | null
          "Invoice Year": number | null
          "Is Late": boolean | null
          "Is Outstanding": boolean | null
          "No. Days taken to Pay": number | null
          "Paid Amount": number | null
          "Payment Month": string | null
          "Payment Status": string | null
          "Payment Year": number | null
        }
        Insert: {
          "Amount Due"?: number | null
          "Client Name"?: string | null
          "Date Invoiced"?: string | null
          "Date Paid"?: string | null
          id: string
          "Invoice Amount"?: number | null
          "Invoice Month"?: string | null
          "Invoice Reference"?: string | null
          "Invoice Year"?: number | null
          "Is Late"?: boolean | null
          "Is Outstanding"?: boolean | null
          "No. Days taken to Pay"?: number | null
          "Paid Amount"?: number | null
          "Payment Month"?: string | null
          "Payment Status"?: string | null
          "Payment Year"?: number | null
        }
        Update: {
          "Amount Due"?: number | null
          "Client Name"?: string | null
          "Date Invoiced"?: string | null
          "Date Paid"?: string | null
          id?: string
          "Invoice Amount"?: number | null
          "Invoice Month"?: string | null
          "Invoice Reference"?: string | null
          "Invoice Year"?: number | null
          "Is Late"?: boolean | null
          "Is Outstanding"?: boolean | null
          "No. Days taken to Pay"?: number | null
          "Paid Amount"?: number | null
          "Payment Month"?: string | null
          "Payment Status"?: string | null
          "Payment Year"?: number | null
        }
        Relationships: []
      }
      monthly_breakdown: {
        Row: {
          client_name: string | null
          id: string
          invoiced_amount: number | null
          month: string | null
          paid_amount: number | null
        }
        Insert: {
          client_name?: string | null
          id?: string
          invoiced_amount?: number | null
          month?: string | null
          paid_amount?: number | null
        }
        Update: {
          client_name?: string | null
          id?: string
          invoiced_amount?: number | null
          month?: string | null
          paid_amount?: number | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
