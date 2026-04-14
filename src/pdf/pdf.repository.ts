import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export class PDFRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async generateSignedUrl(
    filePath: string,
    expiresIn: number,
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('pdfs')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(error);
      throw new Error('Failed to create signed URL');
    }

    return data.signedUrl;
  }
}
