import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import { GetAudioUrlDto } from './get-audio-url.dto';
import { AudioRepository } from './audio.repository.js';

@Injectable()
export class AudioService {
  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getSignedUrl(dto: GetAudioUrlDto) {
    const repo = new AudioRepository(this.supabase);
    const url = await repo.getSignedUrl(dto.filePath, dto.expiresIn);
    return { url };
  }
}
