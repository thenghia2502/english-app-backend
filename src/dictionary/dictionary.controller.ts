import { Controller, Get, Query } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('ipa')
  async getIPA(@Query('word') word: string) {
    const ipa = await this.dictionaryService.getIPA(word);
    return { word, ...ipa };
  }
}
