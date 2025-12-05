import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { User } from '@supabase/supabase-js';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
interface RequestWithUser extends ExpressRequest {
  user: User;
}
@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: RequestWithUser) {
    console.log('Inside controller');
    return req.user; // trả về user info từ Supabase
  }
}
