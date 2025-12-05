import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/upadate-lessson.dto';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}
  @Get()
  async getLessonData() {
    return this.lessonService.getLessonData();
  }

  @Get('/:id')
  async getLessonById(@Param('id') lessonId: string) {
    return this.lessonService.getLessonById(lessonId);
  }

  @Post('/create')
  async create(@Body() dto: CreateLessonDto) {
    return this.lessonService.createLesson(dto);
  }
  @Post('/update-progress')
  update(@Body() dto: UpdateLessonDto) {
    return this.lessonService.updateLessonProgress(dto);
  }
  @Post('/update-words')
  async updateWords(@Body() dto: UpdateLessonDto) {
    return this.lessonService.updateLessonWords(dto);
  }
}
