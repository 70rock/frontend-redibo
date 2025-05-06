export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      renters: {
        Row: {
          id: string
          first_name: string
          last_name: string
          age: number
          occupation: string
          address: string
          email: string
          phone: string
          profile_picture: string
          rating: string
          member_since: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          age: number
          occupation: string
          address: string
          email: string
          phone: string
          profile_picture?: string
          rating?: string
          member_since?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          age?: number
          occupation?: string
          address?: string
          email?: string
          phone?: string
          profile_picture?: string
          rating?: string
          member_since?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          renter_id: string
          host_id: string
          host_name: string
          host_picture: string
          renter_name: string
          reservation_id: string
          behavior_rating: number
          car_care_rating: number
          punctuality_rating: number
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          renter_id: string
          host_id: string
          host_name: string
          host_picture: string
          renter_name: string
          reservation_id: string
          behavior_rating: number
          car_care_rating: number
          punctuality_rating: number
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          renter_id?: string
          host_id?: string
          host_name?: string
          host_picture?: string
          renter_name?: string
          reservation_id?: string
          behavior_rating?: number
          car_care_rating?: number
          punctuality_rating?: number
          rating?: number
          comment?: string
          created_at?: string
        }
      }
      rental_history: {
        Row: {
          id: string
          renter_id: string
          car_model: string
          start_date: string
          end_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          renter_id: string
          car_model: string
          start_date: string
          end_date: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          renter_id?: string
          car_model?: string
          start_date?: string
          end_date?: string
          status?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          renter_id: string
          reporter_id: string
          reason: string
          additional_info: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          renter_id: string
          reporter_id: string
          reason: string
          additional_info: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          renter_id?: string
          reporter_id?: string
          reason?: string
          additional_info?: string
          status?: string
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          host_id: string
          marca: string
          modelo: string
          nombre_usuario: string
          fecha_inicio: string
          fecha_fin: string
          estado: "Confirmada" | "Completada" | "Pendiente"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          marca: string
          modelo: string
          nombre_usuario: string
          fecha_inicio: string
          fecha_fin: string
          estado: "Confirmada" | "Completada" | "Pendiente"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          marca?: string
          modelo?: string
          nombre_usuario?: string
          fecha_inicio?: string
          fecha_fin?: string
          estado?: "Confirmada" | "Completada" | "Pendiente"
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
      [_ in never]: never
    }
  }
}
