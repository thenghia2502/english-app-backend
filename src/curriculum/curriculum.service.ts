import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CurriculumListQuery,
  CurriculumRepository,
  createCurriculumRepository,
} from './curriculum-repository.js';
import { SupabaseService } from 'src/supabase/supabase.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { Database } from 'src/types/supabase';

type UnitRow = {
  curriculum_name: string;
  book_type: string;
  book_title: string;
  level: number;
  unit_title: string;
  unit_order: number | string;
  link?: string;
};

type WordRow = {
  word: string;
  meaning: string;
  uk_ipa?: string;
  us_ipa?: string;
};

type MappingRow = {
  unit_title: string;
  word: string;
};

type CurriculumWord = {
  word: string;
  meaning: string;
  uk_ipa?: string;
  us_ipa?: string;
};

type CurriculumUnit = {
  title: string;
  order: number;
  link?: string;
  words: CurriculumWord[];
};

type CurriculumBook = {
  title: string;
  type: string;
  level_id: string;
  units: CurriculumUnit[];
};

type CurriculumPayload = {
  name: string;
  description: string;
  type: string;
  books: CurriculumBook[];
};

const LEVEL_ID_MAP: Record<number, string> = {
  1: 'uuid-level-1',
  2: 'uuid-level-2',
};

@Injectable()
export class CurriculumService {
  private readonly supabase: SupabaseClient<Database>;

  constructor(private readonly supabaseService: SupabaseService) {
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

    if (!process.env.SUPABASE_URL || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient<Database>(
      process.env.SUPABASE_URL,
      supabaseKey,
    );
  }

  private createRepository(): CurriculumRepository {
    return createCurriculumRepository(this.supabaseService);
  }

  getAllCurriculums(token: string, query: CurriculumListQuery) {
    return this.createRepository().findAll(token, query);
  }

  getCurriculumById(curriculumId: string, token: string) {
    return this.createRepository().findCurriculumById(curriculumId, token);
  }

  getBookById(curriculumId: string, token: string) {
    return this.createRepository().findById(curriculumId, token);
  }

  getWorkBooksByCurriculumId(curriculumId: string, token: string) {
    return this.createRepository().findWorkBooksByCurriculumId(
      token,
      curriculumId,
    );
  }

  private mapLevel(level: number): string {
    return LEVEL_ID_MAP[level] ?? '';
  }

  private transform(
    units: UnitRow[],
    words: WordRow[],
    mapping: MappingRow[],
  ): CurriculumPayload {
    if (!units.length) {
      throw new BadRequestException('Sheet "units" cannot be empty');
    }

    const wordMap = new Map<string, CurriculumWord>();

    words.forEach((word) => {
      wordMap.set(word.word.trim().toLowerCase(), {
        word: word.word,
        meaning: word.meaning,
        uk_ipa: word.uk_ipa,
        us_ipa: word.us_ipa,
      });
    });

    const unitWordMap = new Map<string, CurriculumWord[]>();

    mapping.forEach((mapRow) => {
      const key = mapRow.unit_title;
      if (!unitWordMap.has(key)) {
        unitWordMap.set(key, []);
      }

      const word = wordMap.get(mapRow.word.trim().toLowerCase());
      if (word) {
        unitWordMap.get(key)?.push(word);
      }
    });

    const curriculum: CurriculumPayload = {
      name: units[0].curriculum_name,
      description: '',
      type: units[0].book_type,
      books: [],
    };

    const bookMap = new Map<string, CurriculumBook>();

    units.forEach((row) => {
      const bookKey = row.book_title;

      if (!bookMap.has(bookKey)) {
        bookMap.set(bookKey, {
          title: row.book_title,
          type: row.book_type,
          level_id: this.mapLevel(row.level),
          units: [],
        });

        curriculum.books.push(bookMap.get(bookKey)!);
      }

      const unit: CurriculumUnit = {
        title: row.unit_title,
        order: Number(row.unit_order),
        link: row.link,
        words: unitWordMap.get(row.unit_title) ?? [],
      };

      bookMap.get(bookKey)?.units.push(unit);
    });

    return curriculum;
  }

  private readSheet<T>(workbook: XLSX.WorkBook, sheetName: string): T[] {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new BadRequestException(`Missing required sheet: ${sheetName}`);
    }

    return XLSX.utils.sheet_to_json<T>(sheet);
  }

  uploadExcel(file: { buffer: Buffer }) {
    if (!file?.buffer) {
      throw new BadRequestException('Uploaded file is required');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });

    const unitsSheet = this.readSheet<UnitRow>(workbook, 'units');
    const wordsSheet = this.readSheet<WordRow>(workbook, 'words');
    const mappingSheet = this.readSheet<MappingRow>(workbook, 'words_units');

    const payload = this.transform(unitsSheet, wordsSheet, mappingSheet);

    // const { data, error } = await this.supabase.rpc(
    //   'create_curriculum_full_v2' as never,
    //   { payload } as never,
    // );

    // if (error) throw error;

    // return data as unknown;
    return payload;
  }
}
