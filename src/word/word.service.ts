import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

@Injectable()
export class WordService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  // Lấy tất cả từ
  async getAllWords(): Promise<any> {
    const { data, error } = await this.supabase.from('words').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Lấy từ theo id
  async getWordById(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Tìm từ theo keyword
  async searchWords(keyword: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('words')
      .select('*')
      .ilike('word', `%${keyword}%`);
    if (error) throw new Error(error.message);
    return data || [];
  }
}
