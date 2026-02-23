import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class UpsertUnitNoteDto {
  @IsUUID(4)
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
