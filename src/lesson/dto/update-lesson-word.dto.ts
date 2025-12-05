import { Json } from 'src/word/database.types';

export class UpdateLessonWordsDto {
  lesson_id: string;
  words: Json[];
}
