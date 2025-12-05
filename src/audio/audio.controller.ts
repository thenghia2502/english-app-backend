import { Controller, Get, Query } from '@nestjs/common';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get('/signed-url')
  async getSignedUrl(@Query() query: { word: string; dialect: string }) {
    const dto = {
      filePath: `audio/${query.dialect}/${query.word}.mp3`,
      expiresIn: 60, // thời gian hết hạn 60 giây
    };
    return this.audioService.getSignedUrl(dto);
  }
}
