import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { SupabaseService } from 'src/supabase/supabase.service';

export class UnitRepository {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly supabaseServer: SupabaseClient<Database>,
  ) {}

  async getAllUnits(token: string): Promise<Record<string, unknown>[]> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase.from('units').select('*');
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []) as Record<string, unknown>[];
  }

  async addWordToUnit(
    unitId: string,
    wordIds: string[],
    token: string,
  ): Promise<unknown> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase.rpc('add_word_to_unit', {
      p_unit_id: unitId,
      p_word_ids: wordIds,
    });
    if (response.error) throw new Error(response.error.message);
    return response.data as unknown;
  }

  async checkWordInUnit(
    unitId: string,
    wordId: string,
    userId: string,
  ): Promise<unknown> {
    const response = await this.supabaseServer.rpc('check_word_in_unit', {
      p_unit_id: unitId,
      p_word_id: wordId,
      p_user_id: userId,
    });

    if (response.error) throw new Error(response.error.message);
    return response.data as unknown;
  }
}
