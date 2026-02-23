import { Injectable } from '@nestjs/common';
import { Database, Json } from 'src/types/supabase';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/upadate-lessson.dto';
import { UpdateLessonWordsDto } from './dto/update-lesson-word.dto';
import { SupabaseService } from 'src/supabase/supabase.service';
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
  constructor(private readonly supabaseService: SupabaseService) {}

  // async getLessonData(
  //   accessToken: string,
  //   query: { search?: string; page?: number; limit?: number },
  // ) {
  //   const supabase = this.supabaseService.createClientWithAuth(accessToken);
  //   const { data, error } = await supabase.from('vw_lesson_full').select('*');
  //   if (error) throw new Error(error.message);
  //   return data;
  // }

  async getLessonData(
    accessToken: string,
    query: {
      search?: string;
      sortBy?: 'progress' | 'created_at';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    },
  ) {
    const supabase = this.supabaseService.createClientWithAuth(accessToken);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
      .from('vw_lesson_full')
      .select('*', { count: 'exact' });

    // search
    if (query.search) {
      dbQuery = dbQuery.ilike('name', `%${query.search}%`);
    }

    // sort
    if (query.sortBy) {
      dbQuery = dbQuery.order(query.sortBy, {
        ascending: query.sortOrder !== 'desc',
      });
    } else {
      // default
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    // pagination
    dbQuery = dbQuery.range(from, to);

    const { data, error, count } = await dbQuery;
    if (error) throw new Error(error.message);

    return {
      data,
      meta: {
        page,
        limit,
        total: count,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    };
  }

  async createLesson(dto: CreateLessonDto, accessToken: string) {
    const supabase = this.supabaseService.createClientWithAuth(accessToken);
    const { data, error } = await supabase.rpc('create_lesson_with_units', {
      p_name: dto.name,
      p_curriculum_id: dto.curriculum_original_id,
      p_order: dto.order,
      p_unit_ids: dto.unit_ids, // Supabase JS client map string[] → uuid[]
      p_words: dto.words, // Supabase JS client map string[] → uuid[]
      p_duration: dto.duration || 0,
      p_category: dto.category || '',
      p_description: dto.description || '',
    });
    if (error) throw new Error(error.message);
    return data as CreateLessonResult;
  }

  async getLessonById(lessonId: string, accessToken: string) {
    const supabase = this.supabaseService.createClientWithAuth(accessToken);
    const { data, error } = await supabase.rpc('get_lesson_full_by_id', {
      p_lesson_id: lessonId,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async updateLessonProgress(dto: UpdateLessonDto, accessToken: string) {
    const supabase = this.supabaseService.createClientWithAuth(accessToken);
    const words: Json[] = dto.words.map((w) => ({
      word_id: w.word_id,
      word_progress: w.word_progress,
      word_pause_time: w.word_pause_time,
    }));
    const { data, error } = await supabase.rpc('fn_update_lesson_progress', {
      p_lesson_id: dto.lesson_id,
      p_name: dto.name,
      p_order: dto.order,
      p_unit_ids: dto.unit_ids,
      p_words: words,
    });

    if (error) throw error;
    return data;
  }

  async updateLessonWords(dto: UpdateLessonWordsDto, accessToken: string) {
    const supabase = this.supabaseService.createClientWithAuth(accessToken);
    const words: Json[] = dto.words.map((w) => ({
      word_id: w.word_id,
      word_show_ipa: w.word_show_ipa,
      word_show_word: w.word_show_word,
      word_show_ipa_and_word: w.word_show_ipa_and_word,
      word_reads_per_round: w.word_reads_per_round,
      word_max_read: w.word_max_read,
      word_progress: w.word_progress,
      word_pause_time: w.word_pause_time,
    }));
    console.log('Updating lesson words with:', { dto });
    const { data, error } = await supabase.rpc('fn_update_lesson_detail', {
      p_lesson_id: dto.lesson_id,
      p_words: words,
      p_duration: dto.duration,
      p_description: dto.description,
      p_name: dto.name,
    });
    if (error) throw new Error(error.message);
    return data;
  }
}
