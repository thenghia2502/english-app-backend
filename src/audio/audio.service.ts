import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { GetAudioUrlDto } from './get-audio-url.dto';

@Injectable()
export class AudioService {
  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getSignedUrl(dto: GetAudioUrlDto) {
    const { data, error } = await this.supabase.storage
      .from('store')
      .createSignedUrl(dto.filePath, dto.expiresIn);

    if (error) {
      console.error(error);
      throw new Error('Failed to create signed URL');
    }

    return {
      url: data.signedUrl,
    };
  }
}
