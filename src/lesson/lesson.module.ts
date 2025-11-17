import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';

@Module({
  providers: [LessonService],
  controllers: [LessonController],
})
export class LessonModule {}
