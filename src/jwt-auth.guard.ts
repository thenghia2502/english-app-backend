import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Database } from 'src/types/supabase';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
export interface RequestWithUser extends ExpressRequest {
  user: User & { accessToken: string };
}
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient<Database>;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient<Database>(
      this.config.getOrThrow('SUPABASE_URL'),
      this.config.getOrThrow('SUPABASE_ANON_KEY'),
    );
  }

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const req = context.switchToHttp().getRequest<RequestWithUser>();

  //   const authHeader = req.headers.authorization;
  //   if (!authHeader || Array.isArray(authHeader)) {
  //     throw new UnauthorizedException('Missing Authorization header');
  //   }

  //   const [scheme, token] = authHeader.split(' ');
  //   if (scheme?.toLowerCase() !== 'bearer' || !token) {
  //     throw new UnauthorizedException('Invalid Authorization format');
  //   }

  //   const { data, error } = await this.supabase.auth.getUser(token);

  //   if (error || !data?.user) {
  //     throw new UnauthorizedException(
  //       error instanceof Error ? error.message : 'Unauthorized',
  //     );
  //   }

  //   // 👇 GẮN USER + ACCESS TOKEN
  //   req.user = {
  //     ...data.user,
  //     accessToken: token,
  //   } as any;

  //   return true;
  // }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    const authHeader = req.headers.authorization;
    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException({
        message: 'Invalid Authorization format',
        code: 'INVALID_AUTH_HEADER',
      });
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw new UnauthorizedException({
        message: 'Token is invalid or expired',
        code: 'TOKEN_INVALID_OR_EXPIRED',
      });
    }

    req.user = {
      ...data.user,
      accessToken: token,
    };

    return true;
  }
}
