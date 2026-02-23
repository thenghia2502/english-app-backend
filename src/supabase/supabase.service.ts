import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

@Injectable()
export class SupabaseService {
  createClientWithAuth(accessToken: string) {
    return createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );
  }
}
