import { Module } from '@nestjs/common';
import { PDFService } from './PDF.service';
import { PDFController } from './PDF.controller';

@Module({
  controllers: [PDFController],
  providers: [PDFService],
})
export class PDFModule {}
