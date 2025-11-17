import { Controller, Get, Param, Query } from '@nestjs/common';
import { WordService } from './word.service';

@Controller('words')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  getAllWords() {
    return this.wordService.getAllWords();
  }

  @Get('search')
  searchWords(@Query('q') keyword: string) {
    return this.wordService.searchWords(keyword);
  }

  @Get(':id')
  getWordById(@Param('id') id: string) {
    return this.wordService.getWordById(String(id));
  }
}
