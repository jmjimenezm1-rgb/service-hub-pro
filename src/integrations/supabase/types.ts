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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      aplicaciones: {
        Row: {
          categoria: string
          created_at: string
          deleted_at: string | null
          descripcion: string
          estado: string
          id: number
          limites: string
          logo: string
          modelo_cobro: string
          nombre: string
          precio_base: number
          precio_uso: number
          precio_usuario: number
          proveedor: string
          unidad_uso: string
          updated_at: string
          url: string
          version: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          deleted_at?: string | null
          descripcion?: string
          estado?: string
          id?: number
          limites?: string
          logo?: string
          modelo_cobro?: string
          nombre: string
          precio_base?: number
          precio_uso?: number
          precio_usuario?: number
          proveedor?: string
          unidad_uso?: string
          updated_at?: string
          url?: string
          version?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          deleted_at?: string | null
          descripcion?: string
          estado?: string
          id?: number
          limites?: string
          logo?: string
          modelo_cobro?: string
          nombre?: string
          precio_base?: number
          precio_uso?: number
          precio_usuario?: number
          proveedor?: string
          unidad_uso?: string
          updated_at?: string
          url?: string
          version?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          contacto: string
          created_at: string
          deleted_at: string | null
          direccion: string
          documentos: number
          email: string
          empleados: number
          estado: string
          etiquetas: string[]
          fecha_alta: string
          fecha_baja: string | null
          id: number
          mrr: number
          nif: string
          nombre_comercial: string
          observaciones: string
          pais: string
          provincia: string
          razon_social: string
          sector: string
          telefono: string
          updated_at: string
          web: string
        }
        Insert: {
          contacto?: string
          created_at?: string
          deleted_at?: string | null
          direccion?: string
          documentos?: number
          email?: string
          empleados?: number
          estado?: string
          etiquetas?: string[]
          fecha_alta?: string
          fecha_baja?: string | null
          id?: number
          mrr?: number
          nif: string
          nombre_comercial: string
          observaciones?: string
          pais?: string
          provincia?: string
          razon_social: string
          sector?: string
          telefono?: string
          updated_at?: string
          web?: string
        }
        Update: {
          contacto?: string
          created_at?: string
          deleted_at?: string | null
          direccion?: string
          documentos?: number
          email?: string
          empleados?: number
          estado?: string
          etiquetas?: string[]
          fecha_alta?: string
          fecha_baja?: string | null
          id?: number
          mrr?: number
          nif?: string
          nombre_comercial?: string
          observaciones?: string
          pais?: string
          provincia?: string
          razon_social?: string
          sector?: string
          telefono?: string
          updated_at?: string
          web?: string
        }
        Relationships: []
      }
      consumos: {
        Row: {
          aplicacion_id: number
          cliente_id: number
          consumido: number
          coste_unitario: number
          created_at: string
          id: number
          incluido: number
          metrica: string
          periodo: string
          unidad: string
        }
        Insert: {
          aplicacion_id: number
          cliente_id: number
          consumido?: number
          coste_unitario?: number
          created_at?: string
          id?: number
          incluido?: number
          metrica: string
          periodo: string
          unidad?: string
        }
        Update: {
          aplicacion_id?: number
          cliente_id?: number
          consumido?: number
          coste_unitario?: number
          created_at?: string
          id?: number
          incluido?: number
          metrica?: string
          periodo?: string
          unidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumos_aplicacion_id_fkey"
            columns: ["aplicacion_id"]
            isOneToOne: false
            referencedRelation: "aplicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          aplicacion_id: number | null
          asunto: string
          canal: string
          categoria: string
          cliente_id: number | null
          created_at: string
          destinatario: string
          enviada_en: string
          estado: string
          id: number
          mensaje: string
          plantilla: string
          prioridad: string
        }
        Insert: {
          aplicacion_id?: number | null
          asunto: string
          canal?: string
          categoria?: string
          cliente_id?: number | null
          created_at?: string
          destinatario?: string
          enviada_en?: string
          estado?: string
          id?: number
          mensaje?: string
          plantilla?: string
          prioridad?: string
        }
        Update: {
          aplicacion_id?: number | null
          asunto?: string
          canal?: string
          categoria?: string
          cliente_id?: number | null
          created_at?: string
          destinatario?: string
          enviada_en?: string
          estado?: string
          id?: number
          mensaje?: string
          plantilla?: string
          prioridad?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_aplicacion_id_fkey"
            columns: ["aplicacion_id"]
            isOneToOne: false
            referencedRelation: "aplicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      suscripciones: {
        Row: {
          aplicacion_id: number
          cliente_id: number
          consumo_contratado: number
          consumo_real: number
          created_at: string
          deleted_at: string | null
          descuento: number
          estado: string
          fecha_inicio: string
          fecha_renovacion: string
          id: number
          max_usuarios: number
          modalidad: string
          observaciones: string
          periodicidad: string
          precio: number
          renovacion_automatica: boolean
          updated_at: string
        }
        Insert: {
          aplicacion_id: number
          cliente_id: number
          consumo_contratado?: number
          consumo_real?: number
          created_at?: string
          deleted_at?: string | null
          descuento?: number
          estado?: string
          fecha_inicio: string
          fecha_renovacion: string
          id?: number
          max_usuarios?: number
          modalidad?: string
          observaciones?: string
          periodicidad?: string
          precio?: number
          renovacion_automatica?: boolean
          updated_at?: string
        }
        Update: {
          aplicacion_id?: number
          cliente_id?: number
          consumo_contratado?: number
          consumo_real?: number
          created_at?: string
          deleted_at?: string | null
          descuento?: number
          estado?: string
          fecha_inicio?: string
          fecha_renovacion?: string
          id?: number
          max_usuarios?: number
          modalidad?: string
          observaciones?: string
          periodicidad?: string
          precio?: number
          renovacion_automatica?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_aplicacion_id_fkey"
            columns: ["aplicacion_id"]
            isOneToOne: false
            referencedRelation: "aplicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suscripciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          apellidos: string
          aplicaciones: number[]
          cargo: string
          cliente_id: number | null
          created_at: string
          deleted_at: string | null
          departamento: string
          email: string
          estado: string
          id: number
          idioma: string
          mfa: boolean
          nombre: string
          rol: string
          telefono: string
          ultimo_acceso: string | null
          updated_at: string
          zona_horaria: string
        }
        Insert: {
          apellidos?: string
          aplicaciones?: number[]
          cargo?: string
          cliente_id?: number | null
          created_at?: string
          deleted_at?: string | null
          departamento?: string
          email: string
          estado?: string
          id?: number
          idioma?: string
          mfa?: boolean
          nombre: string
          rol?: string
          telefono?: string
          ultimo_acceso?: string | null
          updated_at?: string
          zona_horaria?: string
        }
        Update: {
          apellidos?: string
          aplicaciones?: number[]
          cargo?: string
          cliente_id?: number | null
          created_at?: string
          deleted_at?: string | null
          departamento?: string
          email?: string
          estado?: string
          id?: number
          idioma?: string
          mfa?: boolean
          nombre?: string
          rol?: string
          telefono?: string
          ultimo_acceso?: string | null
          updated_at?: string
          zona_horaria?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
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
