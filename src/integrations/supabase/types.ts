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
      custom_gestures: {
        Row: {
          id: string
          user_id: string
          gesture_name: string
          image_data: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gesture_name: string
          image_data: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gesture_name?: string
          image_data?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_config: {
        Args: {
          parameter: string
          value: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
