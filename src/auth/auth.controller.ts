import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService, type RegisterResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

type FastifyCookieReply = FastifyReply & {
  setCookie: (
    name: string,
    value: string,
    options: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      path?: string;
    },
  ) => FastifyReply;
};

type OAuthCallbackQuery = {
  code?: string;
  error?: string;
  error_description?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  async googleLogin(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const redirectTo = this.buildGoogleCallbackUrl(req);
    // const redirectTo = 'http://localhost:4000/auth/google/callback';
    const { url } = await this.authService.getGoogleLoginUrl(redirectTo);

    await reply.code(302).redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Query() query: OAuthCallbackQuery,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (query.error) {
      throw new BadRequestException({
        message: query.error_description || query.error,
        code: 'GOOGLE_OAUTH_ERROR',
      });
    }

    if (!query.code) {
      throw new BadRequestException({
        message: 'Missing OAuth code',
        code: 'GOOGLE_OAUTH_CODE_MISSING',
      });
    }

    const { session } = await this.authService.handleGoogleCallback(query.code);

    if (!session) {
      throw new UnauthorizedException('No session returned');
    }

    const cookieReply = reply as FastifyCookieReply;

    cookieReply.setCookie('access_token', session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    cookieReply.setCookie('refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return reply.code(302).redirect('http://localhost:3000/dashboard');
  }

  @Post('register')
  async register(@Body() body: RegisterDto): Promise<RegisterResult> {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('sync-session')
  async syncSession(
    @Body() body: { access_token: string; refresh_token: string },
  ) {
    const { access_token, refresh_token } = body;

    const data = await this.authService.syncSession(
      access_token,
      refresh_token,
    );

    return data;
  }

  private buildGoogleCallbackUrl(req: FastifyRequest): string {
    const forwardedProto = req.headers['x-forwarded-proto'];
    const protocol = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : (forwardedProto?.split(',')[0]?.trim() ?? 'http');

    const hostHeader = req.headers.host;
    if (!hostHeader) {
      throw new InternalServerErrorException({
        message: 'Missing host header for OAuth redirect',
        code: 'GOOGLE_OAUTH_HOST_MISSING',
      });
    }

    return `${protocol}://${hostHeader}/auth/google/callback`;
  }
}
