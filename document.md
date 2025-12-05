# Tài liệu Backend English App

## Mục lục
1. Tổng quan kiến trúc
2. Module & Dependency Injection
3. Tích hợp Supabase
4. Endpoint & Service Function Reference
5. Lược đồ CSDL (Tables, Views, RPC Functions)
6. Luồng dữ liệu (Data Flow Examples)
7. Quy ước xử lý lỗi
8. Biến môi trường
9. Phụ lục: Hướng phát triển

---
## 1. Tổng quan kiến trúc
Hệ thống sử dụng NestJS với kiến trúc module phân lớp và Supabase (Postgres + View + RPC) làm nền tảng dữ liệu.
Nguyên tắc chính:
- Phân tách trách nhiệm: Controller định nghĩa HTTP endpoint; Service chứa logic nghiệp vụ; Truy cập DB qua Supabase client đã type.
- Cấu hình toàn cục: `ConfigModule` load `.env`; `SupabaseModule` cung cấp `SUPABASE_CLIENT` dùng ở mọi nơi.
- Type an toàn: File `word/database.types.ts` định nghĩa đầy đủ schema giúp truy vấn/RPC có kiểm tra compile-time.
- Mở rộng dễ dàng: Mỗi feature (Word, Lesson, Curriculum, Unit, Audio) nằm ở module riêng.
- Ưu tiên RPC cho nghiệp vụ phức tạp: Các thao tác tạo/cập nhật nhiều bảng gói trong hàm Postgres đảm bảo tính toàn vẹn giao dịch.

Sơ đồ luồng cao cấp:
Request → Controller → Service → Supabase Client → Postgres (Tables / Views / RPC) → Response

---
## 2. Module & Dependency Injection
| Module | Mục đích | Provider chính |
|--------|----------|----------------|
| `AppModule` | Module gốc | AppController, AppService |
| `SupabaseModule` (Global) | Khởi tạo Supabase client có type | `SUPABASE_CLIENT` |
| `WordModule` | Chức năng tra cứu từ | WordService |
| `LessonModule` | Quản lý bài học, tiến độ, từ vựng | LessonService |
| `CurriculumModule` | Chương trình học (dự kiến) | TBD |
| `UnitModule` | Đơn vị bài học (dự kiến) | TBD |
| `AudioModule` | Xử lý âm thanh (dự kiến) | TBD |

Ví dụ inject:
```ts
constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient<Database>) {}
```

---
## 3. Tích hợp Supabase
Cấu hình tại `supabase/supabase.module.ts`:
- Đọc biến `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Tạo client với `createClient<Database>` để có type đầy đủ.
- Export dưới dạng provider toàn cục.

Mẫu truy vấn:
```ts
const { data, error } = await this.supabase.from('words').select('*');
if (error) throw new Error(error.message);
```

Gọi RPC:
```ts
const { data, error } = await this.supabase.rpc('create_lesson_with_units', { p_name, p_unit_ids, ... });
```

Lợi ích:
- Tránh `any`, refactor an toàn.
- Một chuẩn chung cho xử lý lỗi.
- Giảm lặp lại logic SQL phức tạp ở code ứng dụng.

---
## 4. Endpoint & Service Functions

### WordController (`/words`)
| Endpoint | Method | Mô tả | Service |
|----------|--------|-------|---------|
| `/words` | GET | Lấy toàn bộ từ | `getAllWords()` |
| `/words/search?q=term` | GET | Tìm kiếm theo từ khóa | `searchWords(keyword)` |
| `/words/by-units?unitIds[]=...` | GET | Lấy từ theo danh sách unit | `getWordsByUnits(unitIds)` |

### WordService
| Hàm | Mục đích | Nguồn dữ liệu |
|-----|----------|--------------|
| `getAllWords()` | Lấy tất cả | Bảng `words` |
| `getWordById(id)` | Lấy một từ theo id | `words` + `.single()` |
| `searchWords(keyword)` | Tìm kiếm không phân biệt hoa thường | `ilike('word', %keyword%)` |
| `getWordsByUnits(unitIds)` | Lấy từ theo nhiều unit | View `vw_words_units` |

### LessonController (`/lesson`)
| Endpoint | Method | Mô tả | Service |
|----------|--------|-------|---------|
| `/lesson` | GET | Lấy danh sách bài học (tổng hợp) | `getLessonData()` |
| `/lesson/:id` | GET | Lấy chi tiết một bài học | `getLessonById(id)` |
| `/lesson/create` | POST | Tạo bài học + gắn units + từ | `createLesson(dto)` |
| `/lesson/update-progress` | POST | Cập nhật tiến độ / thông tin | `updateLessonProgress(dto)` |
| `/lesson/update-words` | POST | Cập nhật từ trong bài học | `updateLessonWords(dto)` |

### LessonService
| Hàm | Mục đích | Tài nguyên |
|-----|----------|-----------|
| `getLessonData()` | Lấy danh sách bài học với dữ liệu ghép | View `vw_lesson_full` |
| `getLessonById(id)` | Lấy một bài học ghép | View + filter |
| `createLesson(dto)` | Tạo bài học phức hợp (lesson + units + words) | RPC `create_lesson_with_units` |
| `updateLessonProgress(dto)` | Cập nhật thứ tự, tên, units, tiến độ | RPC `fn_update_lesson_progress` |
| `updateLessonWords(dto)` | Cập nhật trạng thái từ hàng loạt | RPC `update_lesson_words_bulk` |

Mẫu xử lý lỗi chung:
```ts
if (error) throw new Error(error.message);
```

---
## 5. Lược đồ CSDL
Định nghĩa trong `word/database.types.ts`.

### Bảng chính
| Bảng | Trường quan trọng | Ghi chú |
|------|-------------------|---------|
| `curriculum_original` | id, name, description | Chương trình gốc |
| `lesson` | id, name, curriculum_original_id, order | Bài học |
| `units` | id, title, level_id, order | Đơn vị nội dung |
| `lesson_units` | lesson_id, unit_id | Liên kết bài học–unit |
| `words` | id, word, meaning, ipa, popularity, parent_id | Từ vựng |
| `words_units` | word_id, unit_id | Liên kết từ–unit |
| `levels` / `levels_code` | code, order_index | Phân cấp trình độ |
| `users` | id, email, role | Người dùng hệ thống |

### Views
| View | Mục đích |
|------|----------|
| `vw_lesson_full` | Gom bài học + curriculum + units + words |
| `vw_words_units` | Tra cứu từ theo đơn vị |

### RPC Functions
| Function | Tham số | Trả về | Mục đích |
|----------|---------|--------|---------|
| `create_lesson_with_units` | p_name, p_curriculum_id, p_order, p_unit_ids, p_words | lesson + lesson_units + lesson_words | Tạo bài học nguyên khối |
| `fn_update_lesson_progress` | p_lesson_id, p_name, p_order, p_unit_ids, p_words | Trạng thái mới | Cập nhật tiến độ |
| `update_lesson_words_bulk` | p_lesson_id, p_words | Từ sau cập nhật | Batch update từ |

### Chiến lược typing
- Dùng `Json` cho cấu trúc lồng phức tạp.
- View gán `Insert`/`Update` là `never` để ép chỉ đọc.

---
## 6. Ví dụ luồng dữ liệu

### Tạo bài học
```http
POST /lesson/create
Content-Type: application/json
{
	"curriculum_original_id": "cur-123",
	"name": "Lesson 1",
	"description": "Intro",
	"level_id": 1,
	"unit_ids": ["unit-1","unit-2"],
	"order": 1,
	"words": [ {"word_id": "w1"}, {"word_id": "w2"} ]
}
```
→ Gọi RPC `create_lesson_with_units` trả về cấu trúc tổng hợp.

### Cập nhật tiến độ bài học
```http
POST /lesson/update-progress
{
	"lesson_id": "lesson-123",
	"name": "Lesson 1 Updated",
	"order": 2,
	"unit_ids": ["unit-1","unit-3"],
	"words": [{"word_id":"w1","word_progress":"80","word_pause_time":"10"}]
}
```
→ RPC `fn_update_lesson_progress`.

### Lấy từ theo unit
```http
GET /words/by-units?unitIds[]=unit-1&unitIds[]=unit-2
```
→ View `vw_words_units`.

---
## 7. Quy ước xử lý lỗi
- Ném lỗi ngay khi Supabase trả về `error` giúp flow rõ ràng.
- Có thể mở rộng: custom error class (`NotFoundError`, `ValidationError`).
- Tránh nuốt lỗi – nếu không xử lý sẽ trả về 500.

Quy tắc code:
- Luôn destructure `{ data, error }`.
- Với các mutation phức tạp ưu tiên RPC thay vì nhiều câu lệnh `.insert()`/`.update()`.

---
## 8. Biến môi trường
| Biến | Vai trò |
|------|---------|
| `SUPABASE_URL` | URL của Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bảo mật, chỉ backend) |
| `PORT` | Cổng chạy Nest (mặc định 3000) |

Ghi chú bảo mật:
- Không bao giờ expose `SERVICE_ROLE_KEY` ra frontend.
- Hạn chế số lượng RPC – chỉ những gì thật sự cần.

---
## 9. Phụ lục: Hướng phát triển
- Thêm validation DTO (`class-validator`, `class-transformer`).
- Global exception filter + logging chuẩn.
- Cache (Redis) cho view tổng hợp nặng.
- Phân trang danh sách words / lessons.
- Thêm cơ chế phân quyền (role-based) cho endpoints.

---
Phiên bản tài liệu: 1.0  
Cập nhật cuối: 28/11/2025

