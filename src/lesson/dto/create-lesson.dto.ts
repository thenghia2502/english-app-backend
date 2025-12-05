import { Json } from 'src/word/database.types';

export class CreateLessonDto {
  curriculum_original_id: string;
  name: string;
  description?: string;
  level_id: number;
  unit_ids: string[];
  order: number;
  words: Json[];
}
