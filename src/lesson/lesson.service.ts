import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/upadate-lessson.dto';
import { UpdateLessonWordsDto } from './dto/update-lesson-word.dto';
type LessonUnitInfo = {
  unit_id: string;
  unit_title: string;
  unit_words: {
    word_id: string;
    word_text: string;
  }[];
};

type CreateLessonResult = {
  lesson: Database['public']['Tables']['lesson']['Row'];
  lesson_units: LessonUnitInfo[];
  lesson_words: {
    word_id: string;
    word_text: string;
  }[];
};
@Injectable()
export class LessonService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getLessonData() {
    const { data, error } = await this.supabase
      .from('vw_lesson_full')
      .select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async createLesson(dto: CreateLessonDto) {
    const { data, error } = await this.supabase.rpc(
      'create_lesson_with_units',
      {
        p_name: dto.name,
        p_curriculum_id: dto.curriculum_original_id,
        p_order: dto.order,
        p_unit_ids: dto.unit_ids, // Supabase JS client map string[] → uuid[]
        p_words: dto.words, // Supabase JS client map string[] → uuid[]
      },
    );
    if (error) throw new Error(error.message);
    return data as CreateLessonResult;
  }

  async getLessonById(lessonId: string) {
    const { data, error } = await this.supabase
      .from('vw_lesson_full')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateLessonProgress(dto: UpdateLessonDto) {
    const { data, error } = await this.supabase.rpc(
      'fn_update_lesson_progress',
      {
        p_lesson_id: dto.lesson_id,
        p_name: dto.name,
        p_order: dto.order,
        p_unit_ids: dto.unit_ids,
        p_words: { words: dto.words },
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }

  async updateLessonWords(dto: UpdateLessonWordsDto) {
    const { data, error } = await this.supabase.rpc(
      'update_lesson_words_bulk',
      {
        p_lesson_id: dto.lesson_id,
        p_words: dto.words,
      },
    );
    if (error) throw new Error(error.message);
    return data;
  }
}
