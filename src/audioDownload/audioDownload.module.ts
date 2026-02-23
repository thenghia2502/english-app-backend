// audio-download.module.ts

import { Module } from '@nestjs/common';
import { AudioDownloadService } from './audioDownload.service';
import { AudioDownloadController } from './audioDownload.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AudioDownloadService],
  controllers: [AudioDownloadController],
  exports: [AudioDownloadService],
})
export class AudioDownloadModule {}
