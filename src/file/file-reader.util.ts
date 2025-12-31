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
  // format: word|meaning|ipa
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [word, meaning, ipa] = line.split('|');
      return { word, meaning, ipa };
    });
}

function parseExcelFile(filePath: string): ImportedRow[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<ImportedRow>(sheet);
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
    return XLSX.utils.sheet_to_json<ImportedRow>(sheet);
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
    return XLSX.utils.sheet_to_json<ImportedRow>(sheet);
  } catch (error) {
    throw new Error(
      `Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
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
