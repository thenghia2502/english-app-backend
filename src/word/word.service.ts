import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { WordRepository } from './word.repository.js';
export type { InsertedWord, WordId } from './word.repository.js';

@Injectable()
export class WordService {
  constructor(private readonly supabaseService: SupabaseService) {}
  // Lấy tất cả từ
  getAllWords(token: string): Promise<any> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.getAllWords(token);
  }

  // Lấy từ theo id
  getWordById(id: string, token: string): Promise<any> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.getWordById(id, token);
  }

  // Tìm từ theo keyword
  searchWords(keyword: string, token: string): Promise<any> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.searchWords(keyword, token);
  }

  getWordsByUnits(unitIds: string[], token: string): Promise<any> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.getWordsByUnits(unitIds, token);
  }

  getChildWords(parentId: string, token: string): Promise<any> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.getChildWords(parentId, token);
  }

  addWord(
    wordData: {
      word: string;
      ipa_uk: string;
      ipa_us: string;
      meaning: string;
    },
    token: string,
  ): Promise<import('./word.repository.js').InsertedWord> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.addWord(wordData, token);
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

  checkWordExistsInWordsTable(word: string, token: string): Promise<boolean> {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.checkWordExistsInWordsTable(word, token);
  }

  getWordByName(word: string, token: string) {
    const wordRepository = new WordRepository(this.supabaseService);
    return wordRepository.getWordByName(word, token);
  }
}
