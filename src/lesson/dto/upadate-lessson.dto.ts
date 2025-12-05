export class UpdateLessonDto {
  lesson_id: string;
  name: string;
  order: number;
  unit_ids: string[];
  words: { word_id: string; word_progress: string; word_pause_time: string }[];
}
