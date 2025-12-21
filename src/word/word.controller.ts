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

  @Get('child-of/:wordId')
  getChildWords(@Param('wordId') wordId: string) {
    return this.wordService.getChildWords(wordId);
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
      ipa_uk: string;
      ipa_us: string;
      meaning: string;
    },
  ) {
    return this.wordService.addWord(word);
  }
}
