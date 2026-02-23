import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class WordUpdateDto {
  @IsUUID()
  word_id!: string;

  @IsNumber()
  @Type(() => Number)
  word_progress!: number;

  @IsNumber()
  @Type(() => Number)
  word_max_read!: number;

  @IsNumber()
  @Type(() => Number)
  word_show_ipa!: number;

  @IsNumber()
  @Type(() => Number)
  word_show_word!: number;

  @IsNumber()
  @Type(() => Number)
  word_show_ipa_and_word!: number;

  @IsNumber()
  @Type(() => Number)
  word_reads_per_round!: number;

  @IsNumber()
  @Type(() => Number)
  word_pause_time!: number;
}

export class UpdateLessonWordsDto {
  @IsUUID()
  @IsNotEmpty()
  lesson_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordUpdateDto)
  words!: WordUpdateDto[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  duration!: number;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  name!: string;
}
