import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  providers: [LessonService],
  controllers: [LessonController],
  imports: [SupabaseModule],
})
export class LessonModule {}
