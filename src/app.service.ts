import { Inject, Injectable } from '@nestjs/common';
import { Database } from 'src/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppRepository } from './app.repository.js';

@Injectable()
export class AppService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getHello() {
    const repo = new AppRepository(this.supabase);
    const url = await repo.getSignedUrl('audio/familial_img2_uk.mp3', 60);
    return { url };
  }
}
