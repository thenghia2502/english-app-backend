export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      curriculum_original: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      exam_equivalents: {
        Row: {
          exam_name: string | null;
          id: string;
          level_id: string | null;
          max_point: number | null;
          min_point: number | null;
        };
        Insert: {
          exam_name?: string | null;
          id?: string;
          level_id?: string | null;
          max_point?: number | null;
          min_point?: number | null;
        };
        Update: {
          exam_name?: string | null;
          id?: string;
          level_id?: string | null;
          max_point?: number | null;
          min_point?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'exam_equivalents_level_id_fkey';
            columns: ['level_id'];
            isOneToOne: false;
            referencedRelation: 'levels';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson: {
        Row: {
          created_at: string | null;
          curriculum_original_id: string | null;
          id: string;
          name: string;
          order: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          curriculum_original_id?: string | null;
          id?: string;
          name: string;
          order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          curriculum_original_id?: string | null;
          id?: string;
          name?: string;
          order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_curriculum_original_id_fkey';
            columns: ['curriculum_original_id'];
            isOneToOne: false;
            referencedRelation: 'curriculum_original';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_units: {
        Row: {
          lesson_id: string;
          unit_id: string;
        };
        Insert: {
          lesson_id: string;
          unit_id: string;
        };
        Update: {
          lesson_id?: string;
          unit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lesson_units_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lesson';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lesson_units_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
        ];
      };
      levels: {
        Row: {
          category: string | null;
          code: number | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string | null;
          order_index: number | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          code?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          order_index?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          code?: number | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          order_index?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'levels_code_fkey';
            columns: ['code'];
            isOneToOne: false;
            referencedRelation: 'levels_code';
            referencedColumns: ['id'];
          },
        ];
      };
      levels_code: {
        Row: {
          code: string | null;
          id: number;
        };
        Insert: {
          code?: string | null;
          id: number;
        };
        Update: {
          code?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      units: {
        Row: {
          created_at: string | null;
          id: string;
          level_id: string | null;
          order: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          level_id?: string | null;
          order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          level_id?: string | null;
          order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'units_level_id_fkey';
            columns: ['level_id'];
            isOneToOne: false;
            referencedRelation: 'levels';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string | null;
          password: string | null;
          role: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          name?: string | null;
          password?: string | null;
          role?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          password?: string | null;
          role?: string | null;
        };
        Relationships: [];
      };
      words: {
        Row: {
          created_at: string | null;
          id: string;
          ipa: string | null;
          meaning: string | null;
          parent_id: string | null;
          popularity: number | null;
          updated_at: string | null;
          word: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          ipa?: string | null;
          meaning?: string | null;
          parent_id?: string | null;
          popularity?: number | null;
          updated_at?: string | null;
          word: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          ipa?: string | null;
          meaning?: string | null;
          parent_id?: string | null;
          popularity?: number | null;
          updated_at?: string | null;
          word?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'word_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
        ];
      };
      words_units: {
        Row: {
          unit_id: string;
          word_id: string;
        };
        Insert: {
          unit_id: string;
          word_id: string;
        };
        Update: {
          unit_id?: string;
          word_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'words_units_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'words_units_word_id_fkey';
            columns: ['word_id'];
            isOneToOne: false;
            referencedRelation: 'words';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_lesson_with_units: {
        Args: {
          p_name: string;
          p_curriculum_id?: string | null;
          p_order?: number | null;
          p_unit_ids: string[];
        };
        Returns: {
          lesson: Database['public']['Tables']['lesson']['Row'];
          lesson_units: {
            lesson_id: string;
            unit_id: string;
            unit_title: string;
          }[];
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
