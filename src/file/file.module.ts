import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { WordModule } from 'src/word/word.module';

@Module({
  imports: [WordModule],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
