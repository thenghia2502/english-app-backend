import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export type DictionaryWordRow = {
  id: string;
  uk_ipa: string | null;
  us_ipa: string | null;
  meaning: string | null;
};

export type DictionaryInsertedWord = {
  id: string;
  word: string;
  uk_ipa: string | null;
  us_ipa: string | null;
  meaning: string | null;
};

export class DictionaryRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly supabaseServer: SupabaseClient<Database>,
  ) {}

  async findWord(word: string): Promise<DictionaryWordRow | null> {
    const { data } = await this.supabase
      .from('words')
      .select('id, uk_ipa, us_ipa, meaning')
      .eq('word', word)
      .maybeSingle();

    return data ?? null;
  }

  async insertWord(input: {
    word: string;
    ukIPA: string | null;
    usIPA: string | null;
    meaning: string;
  }): Promise<DictionaryInsertedWord> {
    const { data, error } = await this.supabaseServer
      .from('words')
      .insert({
        word: input.word,
        uk_ipa: input.ukIPA,
        us_ipa: input.usIPA,
        meaning: input.meaning,
      })
      .select('id, word, uk_ipa, us_ipa, meaning')
      .single();

    if (error) throw error;
    return data as DictionaryInsertedWord;
  }
}
