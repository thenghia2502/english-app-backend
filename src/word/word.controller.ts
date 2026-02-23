import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WordService } from './word.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import express from 'express';
@Controller('words')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get()
  getAllWords(@Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.wordService.getAllWords(req.user.accessToken);
  }

  @Get('search')
  searchWords(@Query('q') keyword: string, @Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.wordService.searchWords(keyword, req.user.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-units')
  getWordsByUnits(
    @Query('unitIds') unitIds: string[],
    @Req() req: express.Request,
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    const ids = Array.isArray(unitIds) ? unitIds : [unitIds];
    return this.wordService.getWordsByUnits(ids, req.user.accessToken);
  }

  @Get('child-of/:wordId')
  getChildWords(@Param('wordId') wordId: string, @Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.wordService.getChildWords(wordId, req.user.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getWordById(@Param('id') id: string, @Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.wordService.getWordById(String(id), req.user.accessToken);
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
    @Req() req: express.Request,
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.wordService.addWord(word, req.user.accessToken);
  }
}
