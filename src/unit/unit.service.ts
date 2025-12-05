import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';

@Injectable()
export class UnitService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getAllUnits() {
    const { data, error } = await this.supabase.from('units').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async addWordToUnit(unitId: string, wordId: string) {
    const { data, error } = await this.supabase.rpc('add_word_to_unit', {
      p_unit_id: unitId,
      p_word_id: wordId,
    });
    if (error) throw new Error(error.message);
    return data;
  }
}
