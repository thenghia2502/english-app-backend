import { Module } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';
import { AudioDownloadModule } from '../audioDownload/audioDownload.module';

@Module({
  imports: [AudioDownloadModule],
  providers: [DictionaryService],
  controllers: [DictionaryController],
  exports: [DictionaryService],
})
export class DictionaryModule {}
