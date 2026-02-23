import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';
import * as dotenv from 'dotenv';
import { SupabaseService } from './supabase.service';
dotenv.config();

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_SERVER',
      useFactory: (configService: ConfigService): SupabaseClient<Database> => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>(
          'SUPABASE_SERVICE_ROLE_KEY',
        );

        if (!supabaseUrl || !supabaseKey) {
          throw new Error(
            'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment variables',
          );
        }

        return createClient<Database>(supabaseUrl, supabaseKey);
      },
      inject: [ConfigService],
    },
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (configService: ConfigService): SupabaseClient<Database> => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
          throw new Error(
            'SUPABASE_URL and SUPABASE_ANON_KEY must be defined in environment variables',
          );
        }

        return createClient<Database>(supabaseUrl, supabaseKey);
      },
      inject: [ConfigService],
    },
    SupabaseService,
  ],
  exports: ['SUPABASE_CLIENT', 'SUPABASE_SERVER', SupabaseService],
})
export class SupabaseModule {}
