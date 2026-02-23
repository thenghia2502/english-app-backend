import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class WordProgressDto {
  @IsUUID()
  word_id!: string;

  @IsNumber()
  @Type(() => Number)
  word_progress!: number;
  @IsNumber()
  @Type(() => Number)
  word_pause_time!: number;
}

export class UpdateLessonDto {
  @IsUUID()
  lesson_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsNumber()
  @Type(() => Number)
  order!: number;

  @IsArray()
  @IsUUID('4', { each: true })
  unit_ids!: string[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordProgressDto)
  words!: WordProgressDto[];
}
