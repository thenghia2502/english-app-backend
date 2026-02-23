import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UnitNotesService, UnitNoteRow } from './unit-notes.service';
import { UpsertUnitNoteDto } from './dto/upsert-unit-note.dto';

type AuthedRequest = Request & { user?: { id?: string } };

@Controller('unit-notes')
export class UnitNotesController {
  constructor(private readonly service: UnitNotesService) {}

  @Get(':unitId')
  async getByUnit(
    @Req() req: AuthedRequest,
    @Param('unitId') unitId: string,
  ): Promise<UnitNoteRow | null> {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.service.getByUnit(userId, unitId);
  }

  @Post()
  async upsert(
    @Req() req: AuthedRequest,
    @Body() dto: UpsertUnitNoteDto,
  ): Promise<UnitNoteRow> {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return this.service.upsert(userId, dto.unitId, dto.content);
  }

  @Delete(':unitId')
  async delete(
    @Req() req: AuthedRequest,
    @Param('unitId') unitId: string,
  ): Promise<{ success: true }> {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    await this.service.delete(userId, unitId);
    return { success: true };
  }
}
