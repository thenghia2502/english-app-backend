import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { PDFRepository } from './pdf.repository.js';

@Injectable()
export class PDFService {
  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async generatePDF(filePath: string, expiresIn: number) {
    const repo = new PDFRepository(this.supabase);
    const url = await repo.generateSignedUrl(filePath, expiresIn);
    return { url };
  }
}
