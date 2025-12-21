import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  parseFileContent,
  parseFileBuffer,
  readFileFromClient,
} from './file-reader.util';
import { WordService } from 'src/word/word.service';

@Controller('files')
export class FileController {
  constructor(private readonly wordService: WordService) {}
  @Post('import/test-read-file')
  @UseInterceptors(FileInterceptor('file'))
  async testReadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let data: any;

    if (file.path) {
      data = await readFileFromClient(file.path);
      for (const row of data) {
        const wordText = row.word || row.text; // Support both 'word' and 'text' properties
        if (!wordText) continue; // Skip rows without word value

        // Check if word exists and get its id in one query
        const existingWord = await this.wordService.getWordByName(wordText);
        if (existingWord) {
          // If word exists, use its id
          row.id = existingWord.id;
          console.log('Found existing word:', wordText, 'ID:', existingWord.id);
        } else {
          // If word doesn't exist, add it to the table
          const newWord = await this.wordService.addWord({
            word: wordText,
            ipa_uk: row.ipa_uk || '',
            ipa_us: row.ipa_us || '',
            meaning: row.meaning || '',
          });
          row.id = newWord?.id;
          console.log(
            'Added new word:',
            wordText,
            'Response:',
            newWord,
            'ID:',
            row.id,
          );
        }
      }
    } else if (file.buffer) {
      const filename = file.originalname || 'uploaded.txt';
      const ext = filename.split('.').pop()?.toLowerCase() || '';

      // For binary formats (Excel), pass the buffer directly
      if (ext === 'xlsx' || ext === 'xls') {
        data = await parseFileBuffer(file.buffer, filename);
        console.log('Excel data parsed, total rows:', data?.length);
        console.log('First row sample:', data[0]);

        for (const row of data) {
          console.log('Processing row:', row);
          const wordText = row.word || row.text; // Support both 'word' and 'text' properties
          if (!wordText) {
            console.log('Skipping row - no word found');
            continue; // Skip rows without word value
          }

          // Check if word exists and get its id in one query
          const existingWord = await this.wordService.getWordByName(wordText);
          if (existingWord) {
            // If word exists, use its id
            row.id = existingWord.id;
            console.log(
              'Found existing word:',
              wordText,
              'ID:',
              existingWord.id,
            );
          } else {
            // If word doesn't exist, add it to the table
            const newWord = await this.wordService.addWord({
              word: wordText,
              ipa_uk: row.ipa_uk || '',
              ipa_us: row.ipa_us || '',
              meaning: row.meaning || '',
            });
            row.id = newWord?.id;
            console.log(
              'Added new word:',
              wordText,
              'Response:',
              newWord,
              'ID:',
              row.id,
            );
          }
        }
      } else {
        // For text formats, convert to string
        const content = file.buffer.toString('utf8');
        data = parseFileContent(content, filename);

        for (const row of data) {
          const wordText = row.word || row.text; // Support both 'word' and 'text' properties
          if (!wordText) continue; // Skip rows without word value

          // Check if word exists and get its id in one query
          const existingWord = await this.wordService.getWordByName(wordText);
          if (existingWord) {
            // If word exists, use its id
            row.id = existingWord.id;
            console.log(
              'Found existing word:',
              wordText,
              'ID:',
              existingWord.id,
            );
          } else {
            // If word doesn't exist, add it to the table
            const newWord = await this.wordService.addWord({
              word: wordText,
              ipa_uk: row.ipa_uk || '',
              ipa_us: row.ipa_us || '',
              meaning: row.meaning || '',
            });
            row.id = newWord?.id;
            console.log(
              'Added new word:',
              wordText,
              'Response:',
              newWord,
              'ID:',
              row.id,
            );
          }
        }
      }
    } else {
      throw new BadRequestException('Unsupported upload format');
    }

    return {
      success: true,
      rows: data,
      total: Array.isArray(data) ? data.length : 1,
    };
  }
}
