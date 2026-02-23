import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { WordModule } from 'src/word/word.module';
import { DictionaryModule } from 'src/dictionary/dictionary.module';

@Module({
  imports: [WordModule, DictionaryModule],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
