import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { WordModule } from './word/word.module';
import { LessonModule } from './lesson/lesson.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { UnitModule } from './unit/unit.module';
import { AudioModule } from './audio/audio.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { AudioDownloadModule } from './audioDownload/audioDownload.module';
import { AudioDownloadService } from './audioDownload/audioDownload.service';
import { FileModule } from './file/file.module';
import { SupabaseService } from './supabase/supabase.service';
import { PDFModule } from './pdf/PDF.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    WordModule,
    LessonModule,
    CurriculumModule,
    UnitModule,
    AudioModule,
    ProfileModule,
    AuthModule,
    DictionaryModule,
    AudioDownloadModule,
    FileModule,
    PDFModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtAuthGuard, AudioDownloadService, SupabaseService],
})
export class AppModule {}
