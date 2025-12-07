// audio-download.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../word/database.types';
import audioLinks from './audio-links.json';
import * as cheerio from 'cheerio';

@Injectable()
export class AudioDownloadService {
  private readonly logger = new Logger(AudioDownloadService.name);

  constructor(
    @Inject('SUPABASE_SERVER')
    private readonly supabase: SupabaseClient<Database>,
  ) { }

  /** Lấy link audio từ file JSON */
  async getAudioUrls(word: string) {
    const key = word.toLowerCase().trim();
    const map = audioLinks as Record<string, string[]>; // giả sử JSON mỗi từ là array of link

    const urls: { ukUrl: string | null; usUrl: string | null } = {
      ukUrl: null,
      usUrl: null,
    };

    // 1️⃣ Lấy từ JSON nếu có
    if (map[key]?.length > 0) {
      map[key].forEach((url) => {
        if (url.includes('/uk/')) urls.ukUrl = url;
        else if (url.includes('/us/')) urls.usUrl = url;
      });
    }

    // 2️⃣ Nếu JSON thiếu link → scrape Cambridge
    if (!urls.ukUrl || !urls.usUrl) {
      try {
        const res = await axios.get(
          `https://dictionary.cambridge.org/dictionary/english/${word}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } },
        );
        const $ = cheerio.load(res.data);

        if (!urls.ukUrl) {
          const ukSrc =
            $('span.uk source[type="audio/mpeg"]').attr('src') || null;
          urls.ukUrl = ukSrc
            ? `https://dictionary.cambridge.org${ukSrc}`
            : null;
        }

        if (!urls.usUrl) {
          const usSrc =
            $('span.us source[type="audio/mpeg"]').attr('src') || null;
          urls.usUrl = usSrc
            ? `https://dictionary.cambridge.org${usSrc}`
            : null;
        }
      } catch (error) {
        console.error(
          `Failed to fetch audio URLs from Cambridge for "${word}":`,
          error,
        );
      }
    }

    return urls;
  }

  /** Download file MP3 từ URL */
  async downloadAudio(url: string): Promise<Buffer> {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  /** Upload lên Supabase Storage */
  async uploadToSupabase(path: string, buffer: Buffer): Promise<string> {
    const { error } = await this.supabase.storage
      .from('store')
      .upload(path, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      this.logger.error(error);
      throw error;
    }

    const { data } = await this.supabase.storage
      .from('store')
      .createSignedUrl(path, 60);
    return data?.signedUrl || '';
  }

  /** MAIN FUNCTION */
  async process(word: string) {
    const result: {
      success: boolean;
      word: string;
      sources: { ukUrl: string; usUrl: string };
      storageUrls: { ukStorageUrl: string; usStorageUrl: string };
    } = {
      success: true,
      word,
      sources: {
        ukUrl: '',
        usUrl: '',
      },
      storageUrls: {
        ukStorageUrl: '',
        usStorageUrl: '',
      },
    };

    const { data: ukSigned, error: ukErr } = await this.supabase.storage
      .from('store')
      .createSignedUrl(`audio/uk/${word}.mp3`, 60);

    if (ukErr) {
      // console.error(error);
      // throw new Error('Failed to create signed URL');
      // Lấy object { ukUrl, usUrl }
      const urls = await this.getAudioUrls(word);

      if (!urls.ukUrl) {
        return {
          success: false,
          word,
          message: `Không tìm thấy audio trong danh sách cho từ "${word}"`,
          sources: { ukUrl: '', usUrl: '' },
          storageUrls: { ukStorageUrl: '', usStorageUrl: '' },
        };
      }

      // Xử lý UK
      if (urls.ukUrl) {
        const ukBuffer = await this.downloadAudio(urls.ukUrl);
        const ukStorageUrl = await this.uploadToSupabase(
          `audio/uk/${word}.mp3`,
          ukBuffer,
        );
        result.sources.ukUrl = urls.ukUrl;
        result.storageUrls.ukStorageUrl = ukStorageUrl;
      }

      // return result;
    }
    result.sources.ukUrl = ukSigned?.signedUrl || '';
    result.storageUrls.ukStorageUrl = ukSigned?.signedUrl || '';

    const { data: usSigned, error: usErr } = await this.supabase.storage
      .from('store')
      .createSignedUrl(`audio/us/${word}.mp3`, 60);

    if (usErr) {
      // console.error(error);
      // throw new Error('Failed to create signed URL');
      // Lấy object { ukUrl, usUrl }
      const urls = await this.getAudioUrls(word);

      if (!urls.usUrl) {
        return {
          success: false,
          word,
          message: `Không tìm thấy audio trong danh sách cho từ "${word}"`,
          sources: { ukUrl: '', usUrl: '' },
          storageUrls: { ukStorageUrl: '', usStorageUrl: '' },
        };
      }

      // Xử lý US
      if (urls.usUrl) {
        const usBuffer = await this.downloadAudio(urls.usUrl);
        const usStorageUrl = await this.uploadToSupabase(
          `audio/us/${word}.mp3`,
          usBuffer,
        );
        result.sources.usUrl = urls.usUrl;
        result.storageUrls.usStorageUrl = usStorageUrl;
      }

      // return result;
    }
    result.sources.usUrl = usSigned?.signedUrl || '';
    result.storageUrls.usStorageUrl = usSigned?.signedUrl || '';
    return result;
  }
}
