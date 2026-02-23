import { Json } from 'src/types/supabase';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsObject,
  IsNotEmpty,
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  curriculum_original_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  level_id?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  unit_ids!: string[];

  @IsNumber()
  @Type(() => Number)
  order!: number;
  @IsArray()
  @IsObject({ each: true })
  words!: Json[];

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  category?: string;
}
