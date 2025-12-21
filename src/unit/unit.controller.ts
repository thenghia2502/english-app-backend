import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UnitService } from './unit.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  async getAllUnits() {
    return this.unitService.getAllUnits();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add-word')
  async addWordToUnit(@Body() body: { unitId: string; wordIds: string[] }) {
    return await this.unitService.addWordToUnit(body.unitId, body.wordIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/check-word')
  async checkWordInUnit(@Body() body: { unitId: string; wordId: string }) {
    return await this.unitService.checkWordInUnit(body.unitId, body.wordId);
  }
}
