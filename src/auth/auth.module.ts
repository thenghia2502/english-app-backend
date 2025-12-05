import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService], // service + provider
  controllers: [AuthController], // controller cho module này
  exports: [AuthService], // có thể dùng AuthService ở module khác
})
export class AuthModule {}
