import { Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export class AudioDownloadRepository {
  private readonly logger = new Logger(AudioDownloadRepository.name);

  constructor(private supabase: SupabaseClient<Database>) {}

  async uploadToSupabase(path: string, buffer: Buffer): Promise<string> {
    const { error } = await this.supabase.storage
      .from('store')
      .upload(path, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      this.logger.error(error);
      throw error;
    }

    const { data } = await this.supabase.storage
      .from('store')
      .createSignedUrl(path, 60);
    return data?.signedUrl || '';
  }

  async checkSignedUrlExists(path: string): Promise<boolean> {
    const { error } = await this.supabase.storage
      .from('store')
      .createSignedUrl(path, 60);

    return !error;
  }

  async getSignedUrl(
    path: string,
    expiresIn: number = 60,
  ): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from('store')
      .createSignedUrl(path, expiresIn);

    if (error) {
      return null;
    }

    return data?.signedUrl || null;
  }
}
