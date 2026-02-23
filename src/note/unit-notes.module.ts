import { Module } from '@nestjs/common';
import { UnitNotesService } from './unit-notes.service';
import { UnitNotesController } from './unit-notes.controller';

@Module({
  controllers: [UnitNotesController],
  providers: [UnitNotesService],
})
export class UnitNotesModule {}
