import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/word/database.types';

@Injectable()
export class CurriculumService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getAllCurriculums() {
    const { data, error } = await this.supabase
      .from('vw_curriculum_full')
      .select('*');
    if (error) throw new Error(error.message);
    return data;
  }
  async getCurriculumById(curriculumId: string) {
    const { data, error } = await this.supabase
      .from('vw_curriculum_full')
      .select('*')
      .eq('curriculum_id', curriculumId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
