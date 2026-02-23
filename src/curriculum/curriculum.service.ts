import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class CurriculumService {
  // constructor(
  //   @Inject('SUPABASE_CLIENT')
  //   private readonly supabase: SupabaseClient<Database>,
  // ) {}

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllCurriculums(
    token: string,
    query: { search?: string; page?: number; limit?: number },
  ) {
    const supabase = this.supabaseService.createClientWithAuth(token);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
      .from('vw_curriculum_full')
      .select('*', { count: 'exact' });

    // search
    if (query.search) {
      dbQuery = dbQuery.ilike('name', `%${query.search}%`);
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
  async getCurriculumById(curriculumId: string, token: string) {
    const supabase = this.supabaseService.createClientWithAuth(token);

    const { data, error } = await supabase
      .from('vw_curriculum_full')
      .select('*')
      .eq('id', curriculumId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}
