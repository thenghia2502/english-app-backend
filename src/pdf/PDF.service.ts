import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

@Injectable()
export class PDFService {
  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async generatePDF(filePath: string, expiresIn: number) {
    const { data, error } = await this.supabase.storage
      .from('pdfs')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(error);
      throw new Error('Failed to create signed URL');
    }

    return {
      url: data.signedUrl,
    };
  }
}
