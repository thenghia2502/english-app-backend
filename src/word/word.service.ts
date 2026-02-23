import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

type WordId = { id: string };
type InsertedWord = {
  id: string;
  word: string;
  uk_ipa: string | null;
  us_ipa: string | null;
  meaning: string | null;
};

@Injectable()
export class WordService {
  constructor(private readonly supabaseService: SupabaseService) {}
  // Lấy tất cả từ
  async getAllWords(token: string): Promise<any> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase.from('words').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Lấy từ theo id
  async getWordById(id: string, token: string): Promise<any> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Tìm từ theo keyword
  async searchWords(keyword: string, token: string): Promise<any> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .ilike('word', `%${keyword}%`);
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getWordsByUnits(unitIds: string[], token: string): Promise<any> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
      .from('vw_words_units')
      .select('*')
      .in('unit_id', unitIds);
    if (error) throw new Error(error.message);

    return data;
  }

  async getChildWords(parentId: string, token: string): Promise<any> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
      .from('words')
      .select('ipa, id, word, meaning, parent_id')
      .eq('parent_id', parentId);
    if (error) throw new Error(error.message);
    return data || [];
  }

  async addWord(
    wordData: {
      word: string;
      ipa_uk: string;
      ipa_us: string;
      meaning: string;
    },
    token: string,
  ): Promise<InsertedWord> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
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
    return data as InsertedWord;
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

  async checkWordExistsInWordsTable(
    word: string,
    token: string,
  ): Promise<boolean> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async getWordByName(word: string, token: string): Promise<WordId | null> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const { data, error } = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  }
}
