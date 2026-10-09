# Tài liệu mô tả chức năng — NihoMemo (日本メモ)

> **Clone Quizlet + Cải tiến** — Web app học tiếng Nhật cá nhân, chạy local
> **Đối tượng**: Cá nhân, mục tiêu JLPT N4 → N2
> **Nội dung chính**: Minna no Nihongo (N5→N2) + Hán tự (Kanji) bổ sung
> **Mức sử dụng**: Hàng ngày, 2-4 tiếng/ngày

---

## 1. Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js Fullstack App                  │
│                                                          │
│  ┌─────────────────────────┐  ┌───────────────────────┐  │
│  │   Frontend (App Router) │  │  Backend (API Routes) │  │
│  │   React 19 / Server &   │  │  Route Handlers       │  │
│  │   Client Components     │◄─┼► Next.js /api/...     │  │
│  │   Shadcn UI + Tailwindv4│  │  Prisma ORM           │  │
│  │   TanStack Query+Zustand│  │  Zod Validation      │  │
│  └───────────┬─────────────┘  └───────────┬───────────┘  │
│              │                            │              │
│              └──────────────┬─────────────┘              │
│                             ▼                            │
│                 ┌───────────────────────┐                │
│                 │  Shared (src/schemas) │                │
│                 │  Types, Enums, Zod    │                │
│                 └───────────┬───────────┘                │
└─────────────────────────────┼────────────────────────────┘
                              ▼
                  ┌───────────────────────┐
                  │ PostgreSQL (Docker)   │
                  │ Prisma Client         │
                  └───────────────────────┘
```

- **Fullstack Single App** với Next.js (App Router, React 19)
- **End-to-End Type Safety** qua Zod schemas + TypeScript dùng chung trực tiếp (`src/schemas/`, `src/types/`)
- **Frontend**: Next.js App Router + Shadcn UI + Tailwind CSS v4 + Lucide React
- **Backend**: Next.js Route Handlers (`app/api/*`) + Prisma ORM + PostgreSQL
- **Database**: PostgreSQL 15 (Docker container, cổng 54321)
- **Auth**: Email/Password đăng nhập (JWT Access + Refresh Token lưu HttpOnly Cookies)

---

## 2. Quản lý nội dung học tập

### 2.1. Study Sets (Bộ thẻ học)

- Tạo, sửa, xoá bộ thẻ
- Mỗi bộ thẻ gồm: Tên, Mô tả, Ngôn ngữ (Nhật → Việt), Số lượng thẻ
- Nhân bản (duplicate) bộ thẻ
- Gộp (merge) nhiều bộ thẻ thành một

### 2.2. Flashcard (Thẻ học)

Mỗi thẻ gồm các trường:

| Trường | Bắt buộc | Mô tả |
|:---|:---:|:---|
| **Term** (thuật ngữ) | ✅ | Từ vựng / Kanji / Ngữ pháp tiếng Nhật |
| **Reading** (cách đọc) | ✅ | Hiragana / Katakana (furigana) |
| **Definition** (nghĩa) | ✅ | Nghĩa tiếng Việt |
| **Example** (ví dụ) | ❌ | Câu ví dụ tiếng Nhật + dịch |
| **Image** (hình ảnh) | ❌ | Hình minh hoạ (upload hoặc URL) |
| **Audio** (âm thanh) | ❌ | File audio hoặc TTS tự động |
| **Note** (ghi chú) | ❌ | Ghi chú cá nhân, mẹo nhớ |
| **Tags** (nhãn) | ❌ | VD: `#N4`, `#動詞`, `#chapter-5`, `#khó` |
| **JLPT Level** | ❌ | N5 / N4 / N3 / N2 |
| **Word Type** | ❌ | Danh từ / Động từ / Tính từ / Kanji / Ngữ pháp |

> **Đặc biệt cho tiếng Nhật:**
> - Hỗ trợ hiển thị Furigana (ruby text) trên Kanji
> - Trường riêng cho Kanji: Bộ thủ, Số nét, Âm On/Kun, Từ ghép liên quan
> - Phân loại tự động theo JLPT level

### 2.3. Folders (Thư mục)

- Tổ chức sets theo thư mục: VD `Minna N4/` → `Bài 26/`, `Bài 27/`...
- Thư mục con không giới hạn cấp
- Kéo thả sắp xếp

### 2.4. Tags (Nhãn)

- Gắn tag cho từng thẻ lẻ: `#khó`, `#ngữ-pháp`, `#N2`, `#動詞`
- Thao tác nhanh gọn (auto-complete, gắn hàng loạt)
- Lọc thẻ theo tag xuyên suốt tất cả sets
- Hỗ trợ import tag từ file (hoặc gán thủ công trước khi import)

### 2.5. Tìm kiếm toàn cục

- Tìm kiếm xuyên suốt tất cả sets, folders, tags
- Hỗ trợ tìm bằng tiếng Nhật (Kanji, Hiragana, Romaji) và tiếng Việt
- Kết quả highlight từ khoá

---

## 3. Chế độ học tập (Study Modes)

### 3.1. Flashcard Mode (Lật thẻ)

- Lật thẻ với animation flip 3D
- Shuffle (trộn ngẫu nhiên)
- Phân loại: "Biết rồi" ✅ / "Chưa biết" ❌
- Auto-play (tự động lật + phát âm)
- Chế độ **Reverse**: nhìn Definition → trả lời Term
- Keyboard shortcuts (phím tắt có thể tuỳ chỉnh)
- Text-to-Speech phát âm tiếng Nhật (Web Speech API)
- Hiển thị tiến độ (x/total)

### 3.2. Learn Mode (Học thích ứng)

- Thuật toán adaptive: tập trung vào thẻ yếu
- Nhiều dạng câu hỏi xen kẽ:
  - Multiple Choice (trắc nghiệm)
  - True/False (đúng/sai)
  - Written (tự gõ đáp án)
- Thẻ sai xuất hiện lại nhiều hơn
- Hiển thị % hoàn thành, số thẻ đã master
- Tích hợp chế độ Write (viết đáp án chính xác) và Spell (nghe → viết)
- Override: tự đánh dấu đúng nếu đáp án gần đúng

### 3.3. Test Mode (Kiểm tra)

- Tạo bài kiểm tra từ 1 hoặc nhiều sets
- Dạng câu hỏi (giống Quizlet):
  - ✅ Trắc nghiệm (Multiple Choice)
  - ✅ Đúng/Sai (True/False)
  - ✅ Điền từ (Fill in the blank)
  - ✅ Ghép nối (Matching)
- Tuỳ chỉnh: số câu, tỷ lệ dạng câu, giới hạn thời gian (timed test)
- Chấm điểm tự động + hiển thị đáp án đúng
- Làm lại nhiều lần, so sánh kết quả

### 3.4. Match Mode (Ghép đôi — trò chơi)

- Drag & drop ghép Term ↔ Definition
- Đếm thời gian
- Bảng xếp hạng thời gian tốt nhất (personal best)
- Animation khi ghép đúng/sai
- Chơi lại để cải thiện

### 3.5. Write Mode (Viết đáp án)

- Nhìn Definition → gõ Term chính xác (hoặc ngược lại)
- Kiểm tra chính tả (đặc biệt quan trọng cho Hiragana/Katakana)
- Gợi ý (hint) khi sai nhiều lần
- Hỗ trợ input tiếng Nhật (IME)

### 3.6. Listening Mode (Nghe & viết) — *cải tiến từ Spell*

- Nghe phát âm tiếng Nhật (TTS) → gõ lại chính xác
- Hỗ trợ tốc độ phát âm: chậm / bình thường / nhanh
- Đặc biệt hữu ích cho luyện nghe JLPT

---

## 4. Hệ thống ghi nhớ (Spaced Repetition System — SRS)

### 4.1. Ba chế độ SRS

| Chế độ | Mô tả | Mặc định |
|:---|:---|:---:|
| **Tự động** | Hệ thống tự quyết định interval, người dùng chỉ cần học | ✅ |
| **Đơn giản** (kiểu Quizlet) | Đánh giá: Repeat / Hard / Okay / Easy | ❌ |
| **Nâng cao** (kiểu Anki SM-2) | Thuật toán SM-2, interval chính xác theo ngày | ❌ |

- Mặc định sử dụng chế độ **Tự động** (dễ dùng nhất)
- Có thể chuyển đổi chế độ SRS trong Settings
- Tự động lên lịch ôn tập cho mỗi thẻ
- Hiển thị ngày ôn tập tiếp theo

### 4.2. Review Mistakes (Ôn lại lỗi sai) ⭐ **QUAN TRỌNG**

- **Chú trọng đặc biệt** — tính năng cốt lõi
- Tự động thu thập tất cả thẻ đã trả lời sai từ mọi chế độ
- Tạo "Error Pool" riêng, ôn tập tập trung vào điểm yếu
- Thống kê tần suất sai của từng thẻ
- Gợi ý ôn lại khi thẻ sai quá nhiều lần

### 4.3. Lịch ôn tập (Calendar View)

- Hiển thị dạng lịch: hôm nay cần ôn bao nhiêu thẻ
- Nhìn trước các ngày sắp tới
- Đánh dấu ngày đã hoàn thành ôn tập

---

## 5. Theo dõi tiến độ & Thống kê

### 5.1. Dashboard tổng quan

- Tổng số thẻ đã học hôm nay
- Tỷ lệ đúng/sai (accuracy %)
- Thời gian học (session timer)
- Chuỗi ngày học liên tục (streak) 🔥
- Biểu đồ tiến độ theo thời gian (Recharts)

### 5.2. Progress Tracking chi tiết

- Phân loại thẻ: **Not Studied** / **Still Learning** / **Mastered**
- Tỷ lệ % thành thạo mỗi set
- Biểu đồ tiến độ theo thời gian (line chart)
- **Heat Map** hoạt động (giống GitHub contribution graph)
- Streak tracker (chuỗi ngày liên tục)
- Lọc và học chỉ những từ chưa thuộc

### 5.3. Mục tiêu hàng ngày

- Đặt target: số thẻ / ngày (VD: 50 thẻ/ngày)
- Thanh tiến độ (progress bar) theo mục tiêu
- Thông báo khi đạt/chưa đạt mục tiêu

### 5.4. Export báo cáo

- Xuất báo cáo tiến độ dạng JSON
- Thống kê theo tuần / tháng

---

## 6. Import / Export

### 6.1. Import

| Format | Ưu tiên | Ghi chú |
|:---|:---:|:---|
| **Anki Deck (.apkg)** | ⭐ Cao nhất | Từ extension "Quizlet to Anki" |
| **JSON** | ⭐ Cao | Format chuẩn nội bộ |
| **Quizlet Export** | Trung bình | Nếu tìm được cách extract data |
| **CSV / TSV** | Trung bình | Hỗ trợ cơ bản |
| **Copy-paste text** | Thấp | Dạng "term - definition" mỗi dòng |

- Hỗ trợ mapping trường khi import (chọn cột nào là Term, cột nào là Definition...)
- Preview trước khi import
- Gán tags hàng loạt khi import

### 6.2. Export

- Export ra **JSON** (format chính)
- Export toàn bộ hoặc từng set

### 6.3. Backup / Restore

- Backup toàn bộ database ra file
- Restore từ file backup
- Có thể tự động backup định kỳ (tuỳ chọn)

---

## 7. Giao diện & Trải nghiệm (UI/UX)

### 7.1. Design System

- **Shadcn UI** làm nền tảng component chính
- **Tailwind CSS v4** cho styling
- **Radix UI Primitives** cho accessibility
- **Lucide React** cho icons
- Dark Mode / Light Mode / System mode (next-themes)
- Typography phù hợp hiển thị tiếng Nhật (Noto Sans JP)

### 7.2. Animation & Hiệu ứng

- Lật thẻ 3D (flip animation)
- Slide transitions giữa các thẻ
- Micro-animations cho feedback (đúng/sai)
- Page transitions mượt mà
- Loading skeletons

### 7.3. Responsive & Platform

- **Desktop first** (ưu tiên hiện tại)
- Layout responsive cho tương lai mobile
- Không cần PWA (chạy local)

### 7.4. Keyboard Shortcuts

- Phím tắt cho tất cả thao tác học tập:
  - `Space` = Lật thẻ
  - `←` `→` = Thẻ trước / sau
  - `1-4` = Đánh giá SRS
  - `S` = Shuffle
  - `R` = Reverse
- **Có chức năng tuỳ chỉnh phím tắt** trong Settings
- Hiển thị bảng phím tắt (shortcut cheatsheet)

---

## 8. Text-to-Speech (TTS)

- Sử dụng **Web Speech API** (miễn phí, có sẵn trong trình duyệt)
- Phát âm tiếng Nhật tự động
- Tuỳ chỉnh tốc độ phát âm
- Nút phát âm trên mỗi thẻ
- Auto-play trong chế độ Flashcard

---

## 9. Authentication

- Đăng nhập bằng **Email + Password**
- Đăng nhập bằng **Gmail** (Google OAuth) — cho tương lai
- JWT Access Token + Refresh Token
- Silent Token Refresh (Request Queueing Pattern — giống dự án trước)
- Hiện tại 1 user, nhưng kiến trúc sẵn sàng cho multi-user

---

## 10. Tính năng tương lai (backlog)

> Các tính năng cân nhắc phát triển sau:

- [ ] AI tự động tạo flashcard từ text (miễn phí — local LLM hoặc free API)
- [ ] AI giải thích khi trả lời sai
- [ ] OCR chụp ảnh → tạo thẻ (nếu miễn phí)
- [ ] Mobile responsive hoàn chỉnh
- [ ] Deploy lên VPS/Vercel
- [ ] Nhiều người dùng (multi-tenant)
- [ ] API public cho tích hợp bên ngoài
- [ ] Reminder/Notification ôn tập (cân nhắc vì chạy local)

---

## 11. Tóm tắt tech stack

| Layer | Công nghệ | Ghi chú |
|:---|:---|:---|
| **Framework** | Next.js 15+ (App Router) | Fullstack React 19, Single Project |
| **Frontend** | React 19 + Server & Client Components | Desktop first, SSR & CSR tối ưu |
| **UI** | Shadcn UI + Tailwind CSS v4 + Radix UI | Dark/Light mode |
| **Routing** | Next.js App Router | File-based routing chuẩn Next.js |
| **State** | TanStack Query v5 + Zustand | Server state + Client state |
| **Forms** | React Hook Form + Zod | Form validation type-safe |
| **Charts** | Recharts | Dashboard thống kê |
| **Backend** | Next.js Route Handlers (`app/api/*`) | RESTful API endpoints |
| **ORM** | Prisma ORM | Type-safe queries PostgreSQL |
| **Database** | PostgreSQL 15 (Docker) | Container hoá cổng 54321 |
| **Auth** | JWT (Access + Refresh) / bcryptjs / Cookies | HttpOnly cookie auth + Middleware |
| **Media** | Sharp + Next.js Route Handlers | Upload + convert webp |
| **Shared / Lib** | Zod schemas + TypeScript types (`src/schemas`) | Import nội bộ `@/schemas`, `@/types` |
| **TTS** | Web Speech API | Miễn phí |
| **Import** | Custom parsers | .apkg, JSON, CSV |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **DevOps** | Docker Compose | PostgreSQL container |
| **Linter** | Prettier + ESLint 9 | Code quality |
