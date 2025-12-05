import { Controller, Get, Param } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  getAllCurriculums() {
    return this.curriculumService.getAllCurriculums();
  }

  @Get('/:id')
  getCurriculumById(@Param('id') curriculumId: string) {
    return this.curriculumService.getCurriculumById(curriculumId);
  }
}
