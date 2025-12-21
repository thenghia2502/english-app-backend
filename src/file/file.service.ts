import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';

@Injectable()
export class FileService {
  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabaseServer: SupabaseClient<Database>,
  ) {}

  async commitImportedWords(unitId: string, words: any[], userId?: string) {
    const inserted: string[] = [];

    // Nếu không có userId, lấy user hiện tại
    if (!userId) {
      const { data } = await this.supabaseServer.auth.getUser();
      if (data?.user?.id) {
        userId = data.user.id;
      } else {
        throw new BadRequestException('Unable to determine current user');
      }
    }

    for (const w of words) {
      // validate
      if (!w.word) continue;

      // Find or create word
      let { data: existingWord } = await this.supabaseServer
        .from('words')
        .select('id, word')
        .eq('word', w.word)
        .single();

      let wordId: string;

      if (!existingWord) {
        const { data: newWord, error: insertError } = await this.supabaseServer
          .from('words')
          .insert({
            word: w.word,
            meaning: w.meaning,
            ipa: w.ipa,
          })
          .select('id')
          .single();

        if (insertError || !newWord) continue;
        wordId = newWord.id;
      } else {
        wordId = existingWord.id;
      }

      // // Check if word already in unit
      // const { data: wordInUnit } = await this.supabaseServer
      //   .from('words_units')
      //   .select('id')
      //   .eq('unit_id', unitId)
      //   .eq('word_id', wordId)
      //   .maybeSingle();

      // if (!wordInUnit) {
      //   await this.supabaseServer
      //     .from('words_units')
      //     .insert({ unit_id: unitId, word_id: wordId, user_id: userId });
      //   inserted.push(w.word);
      // }
    }

    return {
      success: true,
      insertedCount: inserted.length,
      inserted,
    };
  }
}
