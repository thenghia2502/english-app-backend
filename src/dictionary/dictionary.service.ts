import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AudioDownloadService } from 'src/audioDownload/audioDownload.service';
import { Database } from 'src/types/supabase';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
    private readonly audioDownloadService: AudioDownloadService,

    @Inject('SUPABASE_SERVER')
    private readonly supabaseServer: SupabaseClient<Database>,
  ) {}
  private cache: Record<
    string,
    {
      id: string;
      ukIPA: string | null;
      usIPA: string | null;
      meaning: string | null;
    }
  > = {};

  async getIPA(word: string): Promise<{
    id: string;
    ukIPA: string | null;
    usIPA: string | null;
    meaning: string | null;
    ukSingleUrl?: string;
    usSingleUrl?: string;
  }> {
    const key = word.toLowerCase();

    try {
      // 1️⃣ Kiểm tra cache trước
      if (this.cache[key]) {
        return this.cache[key];
      }

      // 2️⃣ Kiểm tra DB
      const { data: dbData } = await this.supabase
        .from('words')
        .select('id, uk_ipa, us_ipa, meaning')
        .eq('word', word)
        .maybeSingle(); // Không throw error khi không thấy

      if (dbData) {
        const result = {
          id: dbData.id,
          ukIPA: dbData.uk_ipa,
          usIPA: dbData.us_ipa,
          meaning: dbData.meaning ?? null,
        };

        this.cache[key] = result;
        return result;
      }

      // 3️⃣ Fetch từ Cambridge
      const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(
        word,
      )}`;
      const res = await axios.get<string>(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const $ = cheerio.load(res.data);

      const ukIPA = $('.uk .pron .ipa').first().text() || null;
      const usIPA = $('.us .pron .ipa').first().text() || null;

      const url2 = `https://vdict.com/${encodeURIComponent(word)},1,0,0.html`;
      const res2 = await axios.get<string>(url2, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const $2 = cheerio.load(res2.data);

      // nghĩa nằm trong div.tabcontent > ul > li
      let meaning: string = '';

      // mỗi meaning là 1 li.meaning
      $2('ol.meanings-list li.meaning .meaning-value').each((_, el) => {
        const text = $2(el).text().trim().replace(/\s+/g, ' ');
        // "quả táo"
        if (text) meaning += text + ' ';
      });

      // 4️⃣ Lưu vào DB + trả lại id
      this.logger.log(`Attempting to insert word "${word}" into database...`);
      const { data: insertedWord, error: insertError } =
        await this.supabaseServer
          .from('words')
          .insert({
            word,
            uk_ipa: ukIPA,
            us_ipa: usIPA,
            meaning: meaning,
          })
          .select('id, word, uk_ipa, us_ipa, meaning')
          .single();

      if (insertError) {
        this.logger.error(`Failed to insert word "${word}":`, insertError);
        throw insertError;
      }

      this.logger.log(
        `Successfully inserted word "${word}" with id: ${insertedWord.id}`,
      );

      const result = {
        id: insertedWord.id,
        ukIPA: insertedWord.uk_ipa,
        usIPA: insertedWord.us_ipa,
        meaning: insertedWord.meaning,
        ukSingleUrl: '',
        usSingleUrl: '',
      };

      // Tải audio UK/US và upload lên Supabase storage
      this.logger.log(`Downloading and uploading audio for word "${word}"...`);
      const audioResult = await this.audioDownloadService.process(key);
      this.logger.log(`Audio process result:`, audioResult);

      // Update result with audio URLs
      result.ukSingleUrl = audioResult?.storageUrls?.ukStorageUrl || '';
      result.usSingleUrl = audioResult?.storageUrls?.usStorageUrl || '';

      // 5️⃣ Lưu cache
      this.cache[key] = result;

      return result;
    } catch (err: any) {
      this.logger.error(`Failed to fetch IPA for "${word}":`, err);
      // DO NOT swallow the error silently - rethrow it so the caller knows something went wrong
      throw err;
    }
  }
}
