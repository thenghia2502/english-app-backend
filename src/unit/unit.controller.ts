import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import express from 'express';

@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  async getAllUnits(@Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.unitService.getAllUnits(req.user.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add-word')
  async addWordToUnit(
    @Body() body: { unitId: string; wordIds: string[] },
    @Req() req: express.Request,
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return await this.unitService.addWordToUnit(
      body.unitId,
      body.wordIds,
      req.user.accessToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/check-word')
  async checkWordInUnit(
    @Body() body: { unitId: string; wordId: string; userId: string },
  ) {
    return await this.unitService.checkWordInUnit(
      body.unitId,
      body.wordId,
      body.userId,
    );
  }
}
