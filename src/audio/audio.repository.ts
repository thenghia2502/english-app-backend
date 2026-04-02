import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export class AudioRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSignedUrl(filePath: string, expiresIn: number): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('store')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(error);
      throw new Error('Failed to create signed URL');
    }

    return data.signedUrl;
  }
}
