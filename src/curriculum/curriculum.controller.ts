import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import express from 'express';
import type { MultipartFile } from '@fastify/multipart';
import type { FastifyRequest } from 'fastify';
import type { CurriculumListQuery } from './curriculum-repository.js';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

type FastifyMultipartRequest = FastifyRequest & {
  file: () => Promise<MultipartFile | undefined>;
};

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  private getAccessToken(req: express.Request): string {
    const accessToken = req.user?.accessToken;
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    return accessToken;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllCurriculums(
    @Req() req: express.Request,
    @Query() query: CurriculumListQuery,
  ) {
    const accessToken = this.getAccessToken(req);
    return this.curriculumService.getAllCurriculums(accessToken, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getCurriculumById(
    @Param('id') curriculumId: string,
    @Req() req: express.Request,
  ) {
    const accessToken = this.getAccessToken(req);
    return this.curriculumService.getCurriculumById(curriculumId, accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('books/:id')
  getBookById(@Param('id') curriculumId: string, @Req() req: express.Request) {
    const accessToken = this.getAccessToken(req);
    return this.curriculumService.getBookById(curriculumId, accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('workbooks/:id')
  getWorkBooksByCurriculumId(
    @Param('id') curriculumId: string,
    @Req() req: express.Request,
  ) {
    const accessToken = this.getAccessToken(req);
    return this.curriculumService.getWorkBooksByCurriculumId(
      curriculumId,
      accessToken,
    );
  }

  @Post('upload')
  async upload(@Req() req: FastifyMultipartRequest) {
    const file = await req.file();
    if (!file) {
      throw new BadRequestException('Uploaded file is required');
    }

    const buffer = await file.toBuffer();

    return this.curriculumService.uploadExcel({
      buffer,
    });
  }
}
