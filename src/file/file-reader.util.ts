import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export async function readFileFromClient(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  // Handle Excel files separately
  if (ext === '.xlsx' || ext === '.xls') {
    return parseExcelFile(filePath);
  }

  const content = await fs.promises.readFile(filePath, 'utf8');
  return parseFileContent(content, ext);
}

export function parseFileContent(content: string, extOrFilename: string) {
  const ext = extOrFilename.startsWith('.')
    ? extOrFilename.toLowerCase()
    : path.extname(extOrFilename).toLowerCase();

  if (ext === '.json') {
    return JSON.parse(content);
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
    return parseExcelBuffer(content, ext);
  }

  // Heuristic auto-detection when extension is missing/unsupported
  const trimmed = content.trim();
  if (!trimmed) return [];

  // Try JSON first (handles JSON and JSON Lines when split)
  try {
    const parsed = JSON.parse(trimmed);
    return parsed;
  } catch (_) {
    // Try JSON Lines (one JSON per line)
    const lines = trimmed.split(/\r?\n/);
    if (lines.every((l) => {
      try { JSON.parse(l); return true; } catch { return false; }
    })) {
      return lines.map((l) => JSON.parse(l));
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

function csvToJson(content: string) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim();
    });
    return obj;
  });
}

function tsvToJson(content: string) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');

  return lines.slice(1).map((line) => {
    const values = line.split('\t');
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim();
    });
    return obj;
  });
}

function txtToJson(content: string) {
  // format: word|meaning|ipa
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [word, meaning, ipa] = line.split('|');
      return { word, meaning, ipa };
    });
}

function parseExcelFile(filePath: string) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

function parseExcelBuffer(content: string, ext: string) {
  try {
    // For buffer uploads, content would be binary string
    // We need to convert it back to Buffer for xlsx to read
    const buffer = Buffer.from(content, 'latin1');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

export async function parseFileBuffer(buffer: Buffer, filename: string) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}
