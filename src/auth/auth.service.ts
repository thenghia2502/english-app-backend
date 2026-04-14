import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  AuthError,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

export type RegisterResult = {
  user: User | null;
  session: Session | null;
};

export type GoogleLoginResult = {
  url: string;
};

export type OAuthCallbackResult = {
  user: User | null;
  session: Session | null;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getGoogleLoginUrl(redirectTo: string): Promise<GoogleLoginResult> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw new InternalServerErrorException({
        message: error.message || 'Unable to start Google login',
        code: 'GOOGLE_LOGIN_FAILED',
        details: error.message,
      });
    }

    if (!data.url) {
      throw new InternalServerErrorException({
        message: 'Google login URL was not returned',
        code: 'GOOGLE_LOGIN_URL_MISSING',
      });
    }

    return {
      url: data.url,
    };
  }

  async handleGoogleCallback(code: string) {
    const { data, error } =
      await this.supabase.auth.exchangeCodeForSession(code);

    console.log('EXCHANGE RESULT:', { data, error }); // 🔥 thêm dòng này

    if (error) {
      throw new UnauthorizedException({
        message: error.message || 'Unable to complete Google login',
        code: 'GOOGLE_CALLBACK_FAILED',
        details: error,
      });
    }

    return {
      user: data.user ?? null,
      session: data.session ?? null,
    };
  }

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<RegisterResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await this.supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name,
          role: 'student',
        },
      },
    });

    if (error) {
      throw this.mapSignupError(error);
    }

    return {
      user: data.user ?? null,
      session: data.session ?? null,
    };
  }

  async signUp(email: string, password: string, name: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await this.supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name,
          role: 'student',
        },
      },
    });

    if (error) {
      throw this.mapSignupError(error);
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

  async syncSession(access_token: string, refresh_token: string) {
    const { data, error } = await this.supabase.auth.getUser(access_token);

    if (error || !data.user) {
      throw new UnauthorizedException();
    }

    return {
      user: data.user,
      session: {
        access_token,
        refresh_token,
        expires_in: 3600,
      },
    };
  }

  private mapSignupError(error: AuthError) {
    const normalizedMessage = error.message.toLowerCase();
    const normalizedCode = (error.code ?? '').toLowerCase();

    if (
      normalizedCode === 'email_exists' ||
      normalizedMessage.includes('already registered') ||
      normalizedMessage.includes('already exists')
    ) {
      return new ConflictException({
        message: 'Email is already registered',
        code: 'EMAIL_ALREADY_REGISTERED',
        details: error.message,
      });
    }

    if (
      normalizedCode === 'weak_password' ||
      normalizedCode === 'invalid_signup' ||
      normalizedCode === 'validation_failed' ||
      normalizedMessage.includes('invalid email') ||
      normalizedMessage.includes('invalid password') ||
      normalizedMessage.includes('password')
    ) {
      return new BadRequestException({
        message: error.message,
        code: 'INVALID_CREDENTIALS_FORMAT',
        details: error.message,
      });
    }

    return new InternalServerErrorException({
      message: error.message || 'Unable to register user at the moment',
      code: 'REGISTER_FAILED',
      details: error.message,
    });
  }
}
