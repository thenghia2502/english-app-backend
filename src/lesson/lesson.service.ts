import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';
import { CreateLessonDto } from './dto/create-lesson.dto';
type LessonUnitInfo = {
  lesson_id: string;
  unit_id: string;
  unit_title: string;
};

type CreateLessonResult = {
  lesson: Database['public']['Tables']['lesson']['Row'];
  lesson_units: LessonUnitInfo[];
};
@Injectable()
export class LessonService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getLessonData(): Promise<any> {
    const { data, error } = await this.supabase.from('lesson').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async createLesson(dto: CreateLessonDto): Promise<CreateLessonResult> {
    const { data, error } = await this.supabase.rpc(
      'create_lesson_with_units',
      {
        p_name: dto.name,
        p_curriculum_id: dto.curriculum_original_id ?? null,
        p_order: dto.order ?? null,
        p_unit_ids: dto.unit_ids, // Supabase JS client map string[] → uuid[]
      },
    );
    if (error) throw new Error(error.message);
    return data as CreateLessonResult;
  }
}
