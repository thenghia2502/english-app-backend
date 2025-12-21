import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';

export type ImportStatus = 'new' | 'exists' | 'exists_in_unit' | 'invalid';

export interface ImportWordResult {
  word: string;
  meaning?: string;
  ipa?: string;
  status: ImportStatus;
}

export function normalizeWord(word: string) {
  return word
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export async function parseAndValidateWords(
  rows: any[],
  unitId: string,
  supabaseServer: SupabaseClient<Database>,
): Promise<ImportWordResult[]> {
  const results: ImportWordResult[] = [];

  for (const row of rows) {
    if (!row.word) {
      results.push({ ...row, status: 'invalid' });
      continue;
    }

    const wordNormalized = normalizeWord(row.word);

    // Find word in DB
    const { data: wordInDb } = await supabaseServer
      .from('words')
      .select('id')
      .eq('word', wordNormalized)
      .maybeSingle();

    let status: ImportStatus = 'new';
    let existsInUnit = false;

    if (wordInDb) {
      // Check if word exists in unit
      const { data: inUnit } = await supabaseServer
        .from('words_units')
        .select('id')
        .eq('unit_id', unitId)
        .eq('word_id', wordInDb.id)
        .maybeSingle();

      if (inUnit) {
        status = 'exists_in_unit';
        existsInUnit = true;
      } else {
        status = 'exists';
      }
    }

    results.push({
      word: wordNormalized,
      meaning: row.meaning,
      ipa: row.ipa,
      status,
    });
  }

  return results;
}
