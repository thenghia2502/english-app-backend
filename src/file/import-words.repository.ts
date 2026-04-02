import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export class ImportWordsRepository {
  constructor(private supabaseServer: SupabaseClient<Database>) {}

  async checkWordExists(wordNormalized: string): Promise<boolean> {
    const { data } = await this.supabaseServer
      .from('words')
      .select('id')
      .eq('word', wordNormalized)
      .maybeSingle();

    return !!data;
  }

  async getWordId(wordNormalized: string): Promise<string | null> {
    const { data } = await this.supabaseServer
      .from('words')
      .select('id')
      .eq('word', wordNormalized)
      .maybeSingle();

    return data?.id || null;
  }

  async checkWordExistsInUnit(
    unitId: string,
    wordId: string,
  ): Promise<boolean> {
    const { data } = await this.supabaseServer
      .from('words_units')
      .select('id')
      .eq('unit_id', unitId)
      .eq('word_id', wordId)
      .maybeSingle();

    return !!data;
  }
}
