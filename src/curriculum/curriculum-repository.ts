import { SupabaseService } from 'src/supabase/supabase.service';

export type CurriculumListQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export type CurriculumListResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number | null;
    totalPages: number;
  };
};

export interface CurriculumRepository {
  findAll<T = unknown>(
    token: string,
    query: CurriculumListQuery,
  ): Promise<CurriculumListResult<T>>;
  findById<T = unknown>(curriculumId: string, token: string): Promise<T>;
  findWorkBooksByCurriculumId(
    token: string,
    curriculumId: string,
  ): Promise<unknown[]>;
}

export function createCurriculumRepository(
  supabaseService: SupabaseService,
): CurriculumRepository {
  return {
    async findAll<T = unknown>(
      token: string,
      query: CurriculumListQuery,
    ): Promise<CurriculumListResult<T>> {
      const supabase = supabaseService.createClientWithAuth(token);

      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let dbQuery = supabase
        .from('vw_curriculum_full')
        .select('*', { count: 'exact' });

      if (query.search) {
        dbQuery = dbQuery.ilike('name', `%${query.search}%`);
      }

      dbQuery = dbQuery.range(from, to);

      const { data, error, count } = await dbQuery;
      if (error) throw new Error(error.message);

      return {
        data: (data ?? []) as T[],
        meta: {
          page,
          limit,
          total: count ?? null,
          totalPages: count ? Math.ceil(count / limit) : 0,
        },
      };
    },

    async findById<T = unknown>(
      curriculumId: string,
      token: string,
    ): Promise<T> {
      const supabase = supabaseService.createClientWithAuth(token);

      const { data, error } = await supabase
        .from('vw_curriculum_full')
        .select('*')
        .eq('id', curriculumId)
        .single();

      if (error) throw new Error(error.message);
      return data as T;
    },

    async findWorkBooksByCurriculumId(token: string, curriculumId: string) {
      const supabase = supabaseService.createClientWithAuth(token);

      const { data, error } = await supabase
        .from('curriculum_original')
        .select('id')
        .eq('student_book_id', curriculumId);

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}
