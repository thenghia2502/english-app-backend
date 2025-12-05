import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { SupabaseClient, User, UserResponse } from '@supabase/supabase-js';
import { Database } from './word/database.types';
interface RequestWithUser extends ExpressRequest {
  user: User;
}
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, credentials] = authHeader.split(' ');
    if (!scheme || scheme.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Authorization scheme must be Bearer');
    }

    const token = credentials?.trim();
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    // Optionally log first 8 chars to help debug without exposing full token
    console.log('Bearer token (prefix):', token.slice(0, 8));

    const { data, error }: UserResponse =
      await this.supabase.auth.getUser(token);

    if (error) {
      console.warn('Supabase getUser error:', error.message);
      throw new UnauthorizedException(error.message || 'Invalid token');
    }

    if (!data?.user) {
      throw new UnauthorizedException('User not found for provided token');
    }

    req.user = data.user;
    return true;
  }
}
