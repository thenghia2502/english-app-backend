import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
