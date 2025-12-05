// audio-download.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { AudioDownloadService } from './audioDownload.service';

@Controller('audio')
export class AudioDownloadController {
  constructor(private readonly audioService: AudioDownloadService) {}

  @Get('upload')
  async upload(@Query('word') word: string) {
    return await this.audioService.process(word);
  }
}
