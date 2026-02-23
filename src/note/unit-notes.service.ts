import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export type UnitNoteRow = {
  id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
};

@Injectable()
export class UnitNotesService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getByUnit(userId: string, unitId: string): Promise<UnitNoteRow | null> {
    const { data, error } = await this.supabase
      .from('unit_notes')
      .select('id, content, created_at, updated_at')
      .eq('unit_id', unitId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as UnitNoteRow | null;
  }

  async upsert(
    userId: string,
    unitId: string,
    content: string,
  ): Promise<UnitNoteRow> {
    const { data, error } = await this.supabase
      .from('unit_notes')
      .upsert(
        {
          user_id: userId,
          unit_id: unitId,
          content,
        },
        {
          onConflict: 'user_id,unit_id',
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data as UnitNoteRow;
  }

  async delete(userId: string, unitId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('unit_notes')
      .delete()
      .eq('user_id', userId)
      .eq('unit_id', unitId);

    if (error) throw error;
    return true;
  }
}
