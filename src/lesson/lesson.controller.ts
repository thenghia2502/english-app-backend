import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/upadate-lessson.dto';
import { UpdateLessonWordsDto } from './dto/update-lesson-word.dto';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLessonData(
    @Req() req: express.Request,
    @Query()
    query: {
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: 'progress' | 'created_at';
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.lessonService.getLessonData(req.user.accessToken, query);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getLessonById(
    @Param('id') lessonId: string,
    @Req() req: express.Request,
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.lessonService.getLessonById(lessonId, req.user.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(@Body() dto: CreateLessonDto, @Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.lessonService.createLesson(dto, req.user.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update-progress')
  update(@Body() dto: UpdateLessonDto, @Req() req: express.Request) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.lessonService.updateLessonProgress(dto, req.user.accessToken);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/update-words')
  async updateWords(
    @Body() dto: UpdateLessonWordsDto,
    @Req() req: express.Request,
  ) {
    if (!req.user?.accessToken) {
      throw new UnauthorizedException();
    }
    return this.lessonService.updateLessonWords(dto, req.user.accessToken);
  }
}
