import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Database } from 'src/types/supabase';

@Injectable()
export class UnitService {
  constructor(
    // @Inject('SUPABASE_CLIENT')
    // private readonly supabase: SupabaseClient<Database>,

    @Inject('SUPABASE_SERVER')
    private readonly supabaseServer: SupabaseClient<Database>,

    private readonly supabaseService: SupabaseService,
  ) {}

  async getAllUnits(token: string) {
    const supabase = this.supabaseService.createClientWithAuth(token);

    const { data, error } = await supabase.from('units').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async addWordToUnit(unitId: string, wordIds: string[], token: string) {
    const supabase = this.supabaseService.createClientWithAuth(token);

    const { data, error } = await supabase.rpc('add_word_to_unit', {
      p_unit_id: unitId,
      p_word_ids: wordIds,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async checkWordInUnit(unitId: string, wordId: string, userId: string) {
    const { data, error } = await this.supabaseServer.rpc(
      'check_word_in_unit',
      {
        p_unit_id: unitId,
        p_word_id: wordId,
        p_user_id: userId,
      },
    );

    if (error) throw new Error(error.message);
    return data;
  }
}
