import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import express from 'express';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllCurriculums(@Req() req: express.Request, @Query() query: { search?: string, page?: number; limit?: number }) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.curriculumService.getAllCurriculums(req.user.accessToken, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getCurriculumById(
    @Param('id') curriculumId: string,
    @Req() req: express.Request,
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.curriculumService.getCurriculumById(
      curriculumId,
      req.user.accessToken,
    );
  }
}
