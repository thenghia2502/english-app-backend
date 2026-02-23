import { Controller, Get, Query } from '@nestjs/common';
import { PDFService } from './PDF.service';

@Controller('pdf')
export class PDFController {
  constructor(private readonly pdfService: PDFService) {}

  @Get('/generate-sample')
  async getSignedUrl(@Query() query: { name: string }) {
    const filePath = `audio/${query.name}.mp3`;
    const expiresIn = 60; // thời gian hết hạn 60 giây
    return this.pdfService.generatePDF(filePath, expiresIn);
  }
}
