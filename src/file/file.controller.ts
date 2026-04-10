import { BadRequestException, Controller, Post, Req } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import type { FastifyRequest } from 'fastify';
import { FileService } from './file.service';

type FastifyMultipartRequest = FastifyRequest & {
  file: () => Promise<MultipartFile | undefined>;
};

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('import/test-read-file')
  async testReadFile(@Req() req: FastifyMultipartRequest) {
    const file = await req.file();

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const buffer = await file.toBuffer();

    return this.fileService.readFile({
      buffer,
      filename: file.filename,
      originalname: file.filename,
    });
  }
}
