import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

type CachedClientEntry = {
  client: SupabaseClient<Database>;
  expiresAt: number;
};

@Injectable()
export class SupabaseService {
  private readonly authClientCache = new Map<string, CachedClientEntry>();
  private readonly authClientTtlMs = 5 * 60 * 1000;
  private readonly maxCachedAuthClients = 500;

  createClientWithAuth(accessToken: string) {
    const now = Date.now();
    const cached = this.authClientCache.get(accessToken);

    if (cached && cached.expiresAt > now) {
      return cached.client;
    }

    const client = createClient<Database>(
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

    // Keep cache bounded to avoid unbounded growth with many unique tokens.
    if (this.authClientCache.size >= this.maxCachedAuthClients) {
      const oldestKey = this.authClientCache.keys().next().value;
      if (oldestKey) {
        this.authClientCache.delete(oldestKey);
      }
    }

    this.authClientCache.set(accessToken, {
      client,
      expiresAt: now + this.authClientTtlMs,
    });

    return client;
  }
}
