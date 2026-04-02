import { Injectable } from '@nestjs/common';
import {
  CurriculumListQuery,
  createCurriculumRepository,
} from './curriculum-repository.js';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class CurriculumService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getAllCurriculums(token: string, query: CurriculumListQuery) {
    const curriculumRepository = createCurriculumRepository(
      this.supabaseService,
    );
    return curriculumRepository.findAll(token, query);
  }
  getCurriculumById(curriculumId: string, token: string) {
    const curriculumRepository = createCurriculumRepository(
      this.supabaseService,
    );
    return curriculumRepository.findById(curriculumId, token);
  }

  getWorkBooksByCurriculumId(curriculumId: string, token: string) {
    const curriculumRepository = createCurriculumRepository(
      this.supabaseService,
    );
    return curriculumRepository.findWorkBooksByCurriculumId(
      token,
      curriculumId,
    );
  }
}
