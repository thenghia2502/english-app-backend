import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';
import {
  parseFileContent,
  parseFileBuffer,
  readFileFromClient,
  ImportedRow,
} from './file-reader.util';
import { WordService } from 'src/word/word.service';

@Injectable()
export class FileService {
  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabaseServer: SupabaseClient<Database>,
    private readonly wordService: WordService,
  ) {}

  async parseUploadedFile(file: Express.Multer.File): Promise<ImportedRow[]> {
    if (file.path) {
      return readFileFromClient(file.path);
    }

    if (!file.buffer) {
      throw new BadRequestException('Unsupported upload format');
    }

    const filename = file.originalname || 'uploaded.txt';
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (ext === 'xlsx' || ext === 'xls') {
      const data = parseFileBuffer(file.buffer);
      console.log('Excel data parsed, total rows:', data?.length);
      console.log('First row sample:', data[0]);
      return data;
    }

    const content = file.buffer.toString('utf8');
    return parseFileContent(content, filename);
  }

  async attachWordIds(rows: ImportedRow[]): Promise<void> {
    for (const row of rows) {
      const wordText = this.getWordValue(row);
      if (!wordText) continue;

      const existingWord = await this.wordService.getWordByName(wordText);
      if (existingWord) {
        row.id = existingWord.id;
        continue;
      }

      const newWord = await this.wordService.addWord({
        word: wordText,
        ipa_uk: this.getString(row.ipa_uk),
        ipa_us: this.getString(row.ipa_us),
        meaning: this.getString(row.meaning),
      });
      row.id = newWord.id;
    }
  }

  private getWordValue(row: ImportedRow): string | null {
    const value = (row.word ?? row.text ?? '').toString().trim();
    return value ? value : null;
  }

  private getString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private validateWordRow(row: ImportedRow, index: number) {
    const errors: string[] = [];

    if (!row.text || !row.text.trim()) {
      errors.push('text is required');
    }

    if (!row.meaning || !row.meaning.trim()) {
      errors.push('meaning is required');
    }

    // if (row.word && row.word.length > 50) {
    //   errors.push('word is too long');
    // }

    return {
      isValid: errors.length === 0,
      errors,
      rowIndex: index + 1, // dòng trong file (1-based)
    };
  }

  private validateImportData(rows: ImportedRow[]) {
    const validRows: ImportedRow[] = [];
    const invalidRows: any[] = [];

    rows.forEach((row, index) => {
      const result = this.validateWordRow(row, index);
      if (result.isValid) {
        validRows.push(row);
      } else {
        invalidRows.push({
          rowIndex: result.rowIndex,
          errors: result.errors,
          data: row,
        });
      }
    });

    return {
      validRows,
      invalidRows,
      total: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
    };
  }

  private normalizeWord(word: string) {
    return word.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private deduplicateRows<T extends ImportedRow>(rows: T[]): T[] {
    const map = new Map<string, T>();

    rows.forEach((row) => {
      if (!row.text) return;
      const key = this.normalizeWord(row.text);
      if (!map.has(key)) {
        map.set(key, row);
      }
    });

    return Array.from(map.values());
  }

  async readFile(file: Express.Multer.File) {
    const rows = await this.parseUploadedFile(file);
    const uniqueValidRows = this.deduplicateRows(rows);
    const rowsValidation = this.validateImportData(uniqueValidRows);
    await this.attachWordIds(rows);

    return {
      success: true,
      rows: rowsValidation,
    };
  }
}
