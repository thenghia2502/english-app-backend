import { SupabaseService } from 'src/supabase/supabase.service';

export type WordId = { id: string };
export type WordRow = Record<string, unknown>;

export type InsertedWord = {
  id: string;
  word: string;
  uk_ipa: string | null;
  us_ipa: string | null;
  meaning: string | null;
};

export class WordRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllWords(token: string): Promise<WordRow[]> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase.from('words').select('*');
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []) as WordRow[];
  }

  async getWordById(id: string, token: string): Promise<WordRow | null> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single();
    if (response.error) throw new Error(response.error.message);
    return (response.data as WordRow) ?? null;
  }

  async searchWords(keyword: string, token: string): Promise<WordRow[]> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase
      .from('words')
      .select('*')
      .ilike('word', `%${keyword}%`);
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []) as WordRow[];
  }

  async getWordsByUnits(unitIds: string[], token: string): Promise<WordRow[]> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase
      .from('vw_words_units')
      .select('*')
      .in('unit_id', unitIds);
    if (response.error) throw new Error(response.error.message);

    return (response.data ?? []) as WordRow[];
  }

  async getChildWords(parentId: string, token: string): Promise<WordRow[]> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase
      .from('words')
      .select('ipa, id, word, meaning, parent_id')
      .eq('parent_id', parentId);
    if (response.error) throw new Error(response.error.message);
    return (response.data ?? []) as WordRow[];
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

  async checkWordExistsInWordsTable(
    word: string,
    token: string,
  ): Promise<boolean> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .maybeSingle();
    if (response.error) throw new Error(response.error.message);
    return !!response.data;
  }

  async getWordByName(word: string, token: string): Promise<WordId | null> {
    const supabase = this.supabaseService.createClientWithAuth(token);
    const response = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .maybeSingle();
    if (response.error) throw new Error(response.error.message);
    return (response.data as WordId | null) ?? null;
  }
}
