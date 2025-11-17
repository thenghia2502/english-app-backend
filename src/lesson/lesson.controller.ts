import { Body, Controller, Post } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  async create(@Body() dto: CreateLessonDto) {
    return this.lessonService.createLesson(dto);
  }
}
