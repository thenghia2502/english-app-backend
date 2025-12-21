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
          uk_ipa: string | null;
          us_ipa: string | null;
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
          uk_ipa?: string | null;
          us_ipa?: string | null;
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
          uk_ipa?: string | null;
          us_ipa?: string | null;
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
          user_id: string;
        };
        Insert: {
          unit_id: string;
          word_id: string;
          user_id: string;
        };
        Update: {
          unit_id?: string;
          word_id?: string;
          user_id?: string;
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
          {
            foreignKeyName: 'words_units_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'auth.users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      vw_lesson_full: {
        Row: {
          lesson_id: string | null;
          lesson_name: string | null;
          curriculum_name: string | null;
          unit_ids: Json | null;
          lesson_words: Json | null;
          lesson_progress: string | null;
        };
        Insert: {
          lesson_id?: never;
          lesson_name?: never;
          curriculum_name?: never;
          units?: never;
          lesson_words?: never;
          lesson_progress?: never;
        };
        Update: {
          lesson_id?: never;
          lesson_name?: never;
          curriculum_name?: never;
          units?: never;
          lesson_words?: never;
          lesson_progress?: never;
        };
        Relationships: [];
      };
      vw_curriculum_full: {
        Row: {
          created_at: string | null;
          curriculum_id: string | null;
          curriculum_name: string | null;
          units: Json | null;
          updated_at: string | null;
          levels: Json | null;
        };
        Insert: {
          created_at?: string | null;
          curriculum_id?: string | null;
          curriculum_name?: string | null;
          units?: never;
          updated_at?: string | null;
          levels?: never;
        };
        Update: {
          created_at?: string | null;
          curriculum_id?: string | null;
          curriculum_name?: string | null;
          units?: never;
          updated_at?: string | null;
          levels?: never;
        };
        Relationships: [];
      };
      vw_words_units: {
        Row: {
          unit_id: string;
          unit_name: string | null;
          unit_order: number | null;
          unit_words: {
            original: {
              ipa: string;
              word: string;
              meaning: string;
              word_id: string;
              parent_id: string | null;
            }[];
            custom: {
              ipa: string;
              word: string;
              meaning: string;
              word_id: string;
              parent_id: string | null;
            }[];
          };
        };
        Insert: {
          unit_id: string | null;
          unit_name: string | null;
          unit_order: number | null;
          unit_words: Json | null;
        };
        Update: {
          unit_id?: string | null;
          unit_name?: string | null;
          unit_order?: number | null;
          unit_words?: Json | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_lesson_with_units: {
        Args: {
          p_name: string;
          p_curriculum_id: string;
          p_order: number;
          p_unit_ids: string[];
          p_words: Json[];
        };
        Returns: {
          lesson: Database['public']['Tables']['lesson']['Row'];
          lesson_units: {
            unit_id: string;
            unit_title: string;
            unit_words: {
              word_id: string;
              word_text: string;
            }[];
          }[];
          lesson_words: {
            word_id: string;
            word_text: string;
          }[];
        };
      };
      fn_update_lesson_progress: {
        Args: {
          p_lesson_id: string;
          p_name: string;
          p_order: number;
          p_unit_ids: string[];
          p_words: Json;
        };
        Returns: Json;
      };
      update_lesson_words_bulk: {
        Args: {
          p_lesson_id: string;
          p_words: Json[];
        };
        Returns: boolean;
      };
      add_word_to_unit: {
        Args: {
          p_unit_id: string;
          p_word_ids: string[];
        };
        Returns: boolean;
      };
      get_child_words: {
        Args: {
          p_word_id: string;
        };
        Returns: Json;
      };
      check_word_in_unit: {
        Args: {
          p_unit_id: string;
          p_word_id: string;
        };
        Returns: boolean;
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
