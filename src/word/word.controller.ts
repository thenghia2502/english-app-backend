import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { WordService } from './word.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('by-units')
  getWordsByUnits(@Query('unitIds') unitIds: string[]) {
    const ids = Array.isArray(unitIds) ? unitIds : [unitIds];
    return this.wordService.getWordsByUnits(ids);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getWordById(@Param('id') id: string) {
    return this.wordService.getWordById(String(id));
  }

  @Post('add')
  addWord(
    @Param('word')
    word: {
      word: string;
      ipa: string;
      definition: string;
      example: string;
    },
  ) {
    return this.wordService.addWord(word);
  }
}
