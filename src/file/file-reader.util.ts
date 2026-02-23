import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export type ImportedRow = {
  word?: string;
  text?: string;
  ipa_uk?: string;
  ipa_us?: string;
  meaning?: string;
  id?: string;
} & Record<string, unknown>;

export async function readFileFromClient(
  filePath: string,
): Promise<ImportedRow[]> {
  const ext = path.extname(filePath).toLowerCase();

  // Handle Excel files separately
  if (ext === '.xlsx' || ext === '.xls') {
    return parseExcelFile(filePath);
  }

  const content = await fs.promises.readFile(filePath, 'utf8');
  return parseFileContent(content, ext);
}

export function parseFileContent(
  content: string,
  extOrFilename: string,
): ImportedRow[] {
  const ext = extOrFilename.startsWith('.')
    ? extOrFilename.toLowerCase()
    : path.extname(extOrFilename).toLowerCase();

  if (ext === '.json') {
    return normalizeJsonContent(content);
  }

  if (ext === '.csv') {
    return csvToJson(content);
  }

  if (ext === '.tsv') {
    return tsvToJson(content);
  }

  if (ext === '.txt') {
    return txtToJson(content);
  }

  if (ext === '.xlsx' || ext === '.xls') {
    // For buffer uploads, convert to JSON manually
    return parseExcelBuffer(content);
  }

  // Heuristic auto-detection when extension is missing/unsupported
  const trimmed = content.trim();
  if (!trimmed) return [];

  // Try JSON first (handles JSON and JSON Lines when split)
  try {
    return normalizeJsonContent(trimmed);
  } catch {
    // Try JSON Lines (one JSON per line)
    const lines = trimmed.split(/\r?\n/);
    if (
      lines.every((line) => {
        try {
          JSON.parse(line);
          return true;
        } catch {
          return false;
        }
      })
    ) {
      return lines.flatMap((line) => {
        const parsedLine: unknown = JSON.parse(line);
        return normalizeParsedJson(parsedLine);
      });
    }
  }

  // CSV/TSV detection
  const firstLine = trimmed.split(/\r?\n/, 1)[0];
  if (firstLine.includes(',')) {
    return csvToJson(content);
  }
  if (firstLine.includes('\t')) {
    return tsvToJson(content);
  }
  if (firstLine.includes('|')) {
    return txtToJson(content);
  }

  // Fallback: return lines as objects
  return trimmed.split(/\r?\n/).map((line) => ({ line }));
}

function csvToJson(content: string): ImportedRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const obj: Record<string, string | undefined> = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim();
    });
    return obj as ImportedRow;
  });
}

function tsvToJson(content: string): ImportedRow[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');

  return lines.slice(1).map((line) => {
    const values = line.split('\t');
    const obj: Record<string, string | undefined> = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim();
    });
    return obj as ImportedRow;
  });
}

function txtToJson(content: string): ImportedRow[] {
  // Hỗ trợ nhiều format:
  // 1. word|meaning|ipa (pipe separated)
  // 2. word,word,word (comma separated words in one line)
  // 3. word,meaning (comma separated on multiple lines - CSV format)
  // 4. word (one word per line)

  const lines = content.split('\n').filter((line) => line.trim());

  // Nếu chỉ có 1 dòng và có dấu phẩy → split thành nhiều từ
  if (lines.length === 1 && lines[0].includes(',')) {
    return lines[0]
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean)
      .map((word) => ({ text: word }));
  }

  return lines
    .map((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      // Format: word|meaning|ipa
      if (trimmedLine.includes('|')) {
        const [text, meaning, ipa] = trimmedLine
          .split('|')
          .map((s) => s.trim());
        return { text, meaning, ipa };
      }

      // Format: word,meaning,ipa (CSV without header - nhiều dòng)
      if (trimmedLine.includes(',')) {
        const parts = trimmedLine.split(',').map((s) => s.trim());
        return {
          text: parts[0] || undefined,
          meaning: parts[1] || undefined,
          ipa: parts[2] || undefined,
        };
      }

      // Format: just word (one per line)
      return { text: trimmedLine };
    })
    .filter((row) => row !== null) as ImportedRow[];
}

function parseExcelFile(filePath: string): ImportedRow[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return normalizeExcelData(sheet);
  } catch (error) {
    throw new Error(
      `Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function parseExcelBuffer(content: string): ImportedRow[] {
  try {
    // For buffer uploads, content would be binary string
    // We need to convert it back to Buffer for xlsx to read
    const buffer = Buffer.from(content, 'latin1');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return normalizeExcelData(sheet);
  } catch (error) {
    throw new Error(
      `Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function parseFileBuffer(buffer: Buffer): ImportedRow[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return normalizeExcelData(sheet);
  } catch (error) {
    throw new Error(
      `Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function normalizeExcelData(sheet: XLSX.WorkSheet): ImportedRow[] {
  // Parse với header để lấy data dạng object
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
  });

  if (jsonData.length === 0) return [];

  const firstRow = jsonData[0];
  const keys = Object.keys(firstRow);

  // Kiểm tra nếu có header hợp lệ (text/word, meaning, ipa)
  const hasValidHeader = keys.some((key) =>
    ['text', 'word', 'meaning', 'ipa', 'ipa_uk', 'ipa_us'].includes(
      key.toLowerCase(),
    ),
  );

  if (hasValidHeader) {
    // Excel có header chuẩn - giữ nguyên
    return jsonData
      .map((row) => {
        const normalized: ImportedRow = {};
        Object.keys(row).forEach((key) => {
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'text' || lowerKey === 'word') {
            normalized.text = String(row[key]).trim();
          } else if (lowerKey === 'meaning') {
            normalized.meaning = String(row[key]).trim();
          } else if (lowerKey === 'ipa' || lowerKey === 'ipa_uk') {
            normalized.ipa_uk = String(row[key]).trim();
          } else if (lowerKey === 'ipa_us') {
            normalized.ipa_us = String(row[key]).trim();
          } else {
            normalized[key] = row[key];
          }
        });
        return normalized;
      })
      .filter((row) => row.text);
  }

  // Excel không có header hoặc header không hợp lệ
  // Map columns: cột 1 = text, cột 2 = meaning, cột 3 = ipa
  return jsonData
    .map((row) => {
      const values = Object.values(row).filter(
        (v) => v !== null && v !== undefined && v !== '',
      );
      if (values.length === 0) return null;

      const result: ImportedRow = {
        text: String(values[0]).trim(),
      };

      if (values[1]) result.meaning = String(values[1]).trim();
      if (values[2]) result.ipa_uk = String(values[2]).trim();
      if (values[3]) result.ipa_us = String(values[3]).trim();

      return result;
    })
    .filter((row): row is ImportedRow => row !== null && !!row.text);
}

function normalizeJsonContent(content: string): ImportedRow[] {
  try {
    const parsed: unknown = JSON.parse(content);
    return normalizeParsedJson(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse JSON content: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function normalizeParsedJson(parsed: unknown): ImportedRow[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(isRecord).map((item) => item as ImportedRow);
  }
  if (isRecord(parsed)) {
    return [parsed as ImportedRow];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
