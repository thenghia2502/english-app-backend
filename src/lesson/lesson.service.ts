import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/upadate-lessson.dto';
import { UpdateLessonWordsDto } from './dto/update-lesson-word.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { LessonRepository } from './lesson.repository.js';
@Injectable()
export class LessonService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getLessonData(
    accessToken: string,
    query: {
      search?: string;
      sortBy?: 'progress' | 'created_at';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    },
  ) {
    const lessonRepository = new LessonRepository(this.supabaseService);
    return lessonRepository.getLessonData(accessToken, query);
  }

  createLesson(dto: CreateLessonDto, accessToken: string) {
    const lessonRepository = new LessonRepository(this.supabaseService);
    return lessonRepository.createLesson(dto, accessToken);
  }

  getLessonById(lessonId: string, accessToken: string) {
    const lessonRepository = new LessonRepository(this.supabaseService);
    return lessonRepository.getLessonById(lessonId, accessToken);
  }

  updateLessonProgress(dto: UpdateLessonDto, accessToken: string) {
    const lessonRepository = new LessonRepository(this.supabaseService);
    return lessonRepository.updateLessonProgress(dto, accessToken);
  }

  updateLessonWords(dto: UpdateLessonWordsDto, accessToken: string) {
    const lessonRepository = new LessonRepository(this.supabaseService);
    return lessonRepository.updateLessonWords(dto, accessToken);
  }
}
