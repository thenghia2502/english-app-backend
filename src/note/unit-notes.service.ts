import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import * as unitNotesRepository from './unit-notes.repository.js';
import type { UnitNoteRow } from './unit-notes.repository.js';
export type { UnitNoteRow } from './unit-notes.repository.js';

type UnitNotesRepositoryAdapter = {
  getUnitNoteByUnit: (
    supabase: SupabaseService,
    userId: string,
    unitId: string,
    token: string,
  ) => Promise<UnitNoteRow | null>;
  upsertUnitNote: (
    supabase: SupabaseService,
    userId: string,
    unitId: string,
    content: string,
    token: string,
  ) => Promise<UnitNoteRow>;
  deleteUnitNote: (
    supabase: SupabaseService,
    userId: string,
    unitId: string,
    token: string,
  ) => Promise<boolean>;
};

const unitNotesRepo =
  unitNotesRepository as unknown as UnitNotesRepositoryAdapter;

@Injectable()
export class UnitNotesService {
  constructor(private readonly supabase: SupabaseService) {}

  getByUnit(
    userId: string,
    unitId: string,
    token: string,
  ): Promise<UnitNoteRow | null> {
    return unitNotesRepo.getUnitNoteByUnit(
      this.supabase,
      userId,
      unitId,
      token,
    );
  }

  upsert(
    userId: string,
    unitId: string,
    content: string,
    token: string,
  ): Promise<UnitNoteRow> {
    return unitNotesRepo.upsertUnitNote(
      this.supabase,
      userId,
      unitId,
      content,
      token,
    );
  }

  delete(userId: string, unitId: string, token: string) {
    return unitNotesRepo.deleteUnitNote(this.supabase, userId, unitId, token);
  }
}
