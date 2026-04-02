import { SupabaseService } from 'src/supabase/supabase.service';

export type UnitNoteRow = {
  id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
};

export async function getUnitNoteByUnit(
  supabaseService: SupabaseService,
  userId: string,
  unitId: string,
  token: string,
): Promise<UnitNoteRow | null> {
  const supabase = supabaseService.createClientWithAuth(token);

  const dbquery = supabase
    .from('unit_notes')
    .select('id, content, created_at, updated_at')
    .eq('unit_id', unitId)
    .eq('user_id', userId)
    .maybeSingle();

  const { data, error } = await dbquery;

  if (error) throw error;
  return data as UnitNoteRow | null;
}

export async function upsertUnitNote(
  supabaseService: SupabaseService,
  userId: string,
  unitId: string,
  content: string,
  token: string,
): Promise<UnitNoteRow> {
  const supabase = supabaseService.createClientWithAuth(token);

  const { data, error } = await supabase
    .from('unit_notes')
    .upsert(
      {
        user_id: userId,
        unit_id: unitId,
        content,
      },
      {
        onConflict: 'user_id,unit_id',
      },
    )
    .select()
    .single();

  if (error) throw error;
  return data as UnitNoteRow;
}

export async function deleteUnitNote(
  supabaseService: SupabaseService,
  userId: string,
  unitId: string,
  token: string,
): Promise<boolean> {
  const supabase = supabaseService.createClientWithAuth(token);
  const { error } = await supabase
    .from('unit_notes')
    .delete()
    .eq('user_id', userId)
    .eq('unit_id', unitId);

  if (error) throw error;
  return true;
}
