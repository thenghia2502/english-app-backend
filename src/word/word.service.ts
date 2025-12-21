import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

@Injectable()
export class WordService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) { }

  // Lấy tất cả từ
  async getAllWords(): Promise<any> {
    const { data, error } = await this.supabase.from('words').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Lấy từ theo id
  async getWordById(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Tìm từ theo keyword
  async searchWords(keyword: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .ilike('word', `%${keyword}%`);
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getWordsByUnits(unitIds: string[]): Promise<any> {
    const { data, error } = await this.supabase
      .from('vw_words_units')
      .select('*')
      .in('unit_id', unitIds);
    if (error) throw new Error(error.message);

    return data;
  }

  async getChildWords(parentId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .select('ipa, id, word, meaning, parent_id')
      .eq('parent_id', parentId);
    if (error) throw new Error(error.message);
    return data || [];
  }

  async addWord(wordData: {
    word: string;
    ipa_uk: string;
    ipa_us: string;
    meaning: string;
  }): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .insert({
        word: wordData.word,
        uk_ipa: wordData.ipa_uk,
        us_ipa: wordData.ipa_us,
        meaning: wordData.meaning,
      })
      .select('id, word, uk_ipa, us_ipa, meaning')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async validWord(word: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (res.ok) {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  async checkWordExistsInWordsTable(word: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async getWordByName(word: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }
}
