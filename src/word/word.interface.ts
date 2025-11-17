export interface Word {
  id: number;
  word: string;
  meaning: string;
  ipa: string;
  popularity: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}
