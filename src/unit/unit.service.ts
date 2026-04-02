import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Database } from 'src/types/supabase';
import { UnitRepository } from './unit.repository.js';

@Injectable()
export class UnitService {
  constructor(
    // @Inject('SUPABASE_CLIENT')
    // private readonly supabase: SupabaseClient<Database>,

    @Inject('SUPABASE_SERVER')
    private readonly supabaseServer: SupabaseClient<Database>,

    private readonly supabaseService: SupabaseService,
  ) {}

  getAllUnits(token: string) {
    const unitRepository = new UnitRepository(
      this.supabaseService,
      this.supabaseServer,
    );
    return unitRepository.getAllUnits(token);
  }

  addWordToUnit(unitId: string, wordIds: string[], token: string) {
    const unitRepository = new UnitRepository(
      this.supabaseService,
      this.supabaseServer,
    );
    return unitRepository.addWordToUnit(unitId, wordIds, token);
  }

  checkWordInUnit(unitId: string, wordId: string, userId: string) {
    const unitRepository = new UnitRepository(
      this.supabaseService,
      this.supabaseServer,
    );
    return unitRepository.checkWordInUnit(unitId, wordId, userId);
  }
}
