import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: 'student',
        },
      },
    });

    if (error) {
      throw new BadRequestException({
        message: error.message,
        code: 'SIGNUP_FAILED',
      });
    }
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new UnauthorizedException({
        message: 'Invalid login credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    return data;
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedException({
        message: 'Token is invalid or expired',
        code: 'TOKEN_INVALID_OR_EXPIRED',
      });
    }

    return data;
  }
}
