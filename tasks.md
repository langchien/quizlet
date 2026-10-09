# 🚀 Kế hoạch phát triển NihoMemo — Nhiệm vụ tuần tự cho AI

> **Dự án**: NihoMemo (日本メモ) — Web app học tiếng Nhật cá nhân
> **Kiến trúc**: Next.js Fullstack (App Router)
> **Tech stack**: Next.js 16+, React 19, Prisma 7 (@prisma/adapter-pg), PostgreSQL 15, Shadcn UI, Tailwind CSS v4, Lucide React, Zustand, TanStack Query v5, Zod
> **Tham chiếu**: [func.md](file:///p:/Nodejs/quizlet/func.md) | [PRISMA_7_GUIDE.md](file:///p:/Nodejs/quizlet/docs/PRISMA_7_GUIDE.md)

---

## Quy tắc chung khi thực hiện

1. **Mỗi Phase hoàn thành phải chạy được**, không để code dở dang
2. Sau mỗi task, chạy test và xác nhận tự động hoạt động trước khi sang task tiếp
3. Sử dụng **TypeScript strict mode** xuyên suốt
4. Mọi schema (Zod) và type dùng chung đặt trong `src/schemas/` và `src/types/` (alias `@/schemas`, `@/types`)
5. Code comment bằng **tiếng Việt** cho dễ maintain
6. UI tuân theo **Shadcn UI** style, hỗ trợ **Dark/Light mode** từ đầu
7. Database migrations quản lý qua **Prisma 7** (tuân thủ [PRISMA_7_GUIDE.md](file:///p:/Nodejs/quizlet/docs/PRISMA_7_GUIDE.md))
8. Sau khi hoàn thành 1 phase hoặc 1 vài task lớn thì chạy format, chạy pnpm lint nếu có lỗi hoặc cảnh báo phải sửa ngay và báo lại cho tôi cân nhắc nên tắt lỗi đó đi hay là nên fix code sau đó tạo commit chi tiết bằng tiếng việt có dấu và commit tự động

---

## 📦 PHASE 0: Khởi tạo dự án & Hạ tầng cơ sở

> **Mục tiêu**: Setup Next.js App Router, cấu hình Tailwind CSS v4, Shadcn UI, Docker PostgreSQL, Prisma 7 ORM, chạy được "Hello World" và kết nối DB

### Task 0.1 — Khởi tạo Next.js App Router Project

```
Yêu cầu:
- Khởi tạo Next.js 16+ (App Router) với React 19 và TypeScript
- Cấu trúc thư mục:
  - src/app/ (App Router pages, layouts, route handlers)
  - src/components/ (Shadcn UI & custom components)
  - src/lib/ (utilities, prisma client, api client)
  - src/schemas/ (Zod schemas)
  - src/types/ (TypeScript types & enums)
  - src/stores/ (Zustand client state)
  - src/hooks/ (Custom React hooks)
  - prisma/ (Prisma schema, migrations, seed)
- File package.json với các scripts:
  - "dev": chạy Next.js dev server (cổng 30001)
  - "build": build Next.js production (chạy prisma generate && next build)
  - "start": chạy Next.js production
  - "lint": kiểm tra code bằng ESLint
  - "db:up": docker compose up -d
  - "db:down": docker compose down
  - "db:migrate": prisma migrate dev
  - "db:generate": prisma generate
  - "db:studio": prisma studio
  - "db:seed": prisma db seed
- Cấu hình path alias: @/* → ./src/* trong tsconfig.json
- File .gitignore (node_modules, .next, .env, src/generated/, uploads/, etc.)
- Prettier + ESLint + prettier-plugin-tailwindcss (.prettierignore bỏ qua src/generated/)
```

### Task 0.2 — Cấu hình UI & Design System

```
Yêu cầu:
- Cài đặt và cấu hình:
  - Tailwind CSS v4 (@tailwindcss/postcss)
  - Shadcn UI (init + cấu hình components.json)
  - Lucide React (icons)
  - next-themes (hỗ trợ dark/light/system mode)
  - Sonner (toast notifications)
  - Radix UI primitives (@radix-ui/react-slot, @radix-ui/react-dialog, ...)
  - class-variance-authority + clsx + tailwind-merge (hàm cn() trong src/lib/utils.ts)
  - TanStack Query v5 (@tanstack/react-query + QueryClientProvider)
- Cấu hình font tiếng Nhật:
  - Noto Sans JP và Inter qua next/font/google
- Tạo các UI components cơ bản:
  - Button (Shadcn UI)
  - ThemeProvider + ModeToggle (Dark/Light switch)
  - Root layout (src/app/layout.tsx) tích hợp ThemeProvider, QueryClientProvider, Toaster
```

### Task 0.3 — Setup Database & Docker (Prisma 7)

```
Yêu cầu:
- docker-compose.yml:
  - PostgreSQL 15-alpine container
  - Volume persistent data (nihomemo_pgdata)
  - Port 54321:5432
  - Env: POSTGRES_USER=nihomemo, POSTGRES_PASSWORD=nihomemo_password123, POSTGRES_DB=nihomemo
- Prisma 7 ORM:
  - prisma.config.ts quản lý config, migrations path và database URL
  - prisma/schema.prisma kết nối PostgreSQL (provider = "prisma-client", output = "../src/generated/prisma")
  - Model User cơ bản (id, email, name, password, avatar, createdAt, updatedAt)
  - Singleton PrismaClient trong src/lib/prisma.ts sử dụng @prisma/adapter-pg + pg.Pool
- Khởi động container: docker compose up -d → prisma migrate dev → prisma generate
- Xác nhận kết nối DB thành công
```

### Task 0.4 — Cấu hình Core Utilities, Schemas & State

```
Yêu cầu:
- Schemas & Types trong src/schemas/ và src/types/:
  - JLPTLevel enum: N5, N4, N3, N2, N1
  - WordType enum: Noun, Verb, IAdjective, NaAdjective, Adverb, Kanji, Grammar, Other
  - CardStatus enum: New, Learning, Review, Mastered
  - StudyMode enum: Flashcard, Learn, Test, Match, Write, Listen
  - Constants: APP_NAME, APP_TITLE, JLPT_LEVELS, STUDY_MODES
  - Zod schemas cơ bản: UserBaseSchema, HealthCheckResponseSchema
- Client State:
  - Zustand store (src/stores/useAppStore.ts với persist middleware)
- API Client:
  - Axios instance hoặc Fetch wrapper (src/lib/api.ts)
```

### Task 0.5 — Health Check Endpoint & Env Validation

```
Yêu cầu:
- Next.js Route Handler:
  - GET /api/health (src/app/api/health/route.ts)
  - Kiểm tra trạng thái máy chủ và kết nối PostgreSQL qua Prisma
  - Trả về: { status: "ok", timestamp, uptime, database: "connected" }
- Env validation:
  - Cấu hình validate biến môi trường bằng Zod trong src/lib/env.ts
- File .env.example và .env:
  - DATABASE_URL="postgresql://nihomemo:nihomemo_password123@localhost:54321/nihomemo?schema=public"
  - JWT_ACCESS_SECRET
  - JWT_REFRESH_SECRET
  - JWT_ACCESS_EXPIRES_IN="15m"
  - JWT_REFRESH_EXPIRES_IN="7d"
  - NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### ✅ Checkpoint Phase 0

```
Kiểm tra:
- [ ] pnpm dev chạy Next.js thành công tại http://localhost:3000
- [ ] Trang chủ hiển thị "Hello NihoMemo" với Shadcn UI + Dark mode toggle
- [ ] Route Handler trả về GET /api/health → { status: "ok", database: "connected" }
- [ ] PostgreSQL Docker container chạy trên port 54321, Prisma kết nối thành công
- [ ] Import @/schemas, @/lib, @/components hoạt động hoàn hảo
```

---

## 📦 PHASE 1: Authentication & Database Schema

> **Mục tiêu**: Đăng nhập/đăng ký hoạt động, database schema đầy đủ 10 models

### Task 1.1 — Prisma Schema đầy đủ

```
Yêu cầu — Thiết kế các models:

1. User
   - id, email, name, password (hashed), avatar
   - settings (JSON): theme, srsMode, dailyGoal, keyboardShortcuts
   - createdAt, updatedAt

2. Folder
   - id, name, description, parentId (self-relation cho nested folders)
   - userId, order (sắp xếp), createdAt, updatedAt

3. StudySet
   - id, name, description, language (source/target)
   - folderId (nullable), userId
   - cardCount (denormalized for perf)
   - createdAt, updatedAt

4. Card
   - id, studySetId
   - term, reading (furigana), definition
   - example, exampleTranslation
   - imageUrl, audioUrl
   - note
   - jlptLevel (enum), wordType (enum)
   - kanji-specific: radicals, strokeCount, onReading, kunReading, compounds
   - order (trong set)
   - createdAt, updatedAt

5. Tag
   - id, name, color, userId
   - Many-to-many với Card qua CardTag junction table

6. CardTag (junction)
   - cardId, tagId

7. SRSData (Spaced Repetition data per card per user)
   - id, cardId, userId
   - status: New / Learning / Review / Mastered
   - easeFactor, interval, repetitions
   - nextReviewDate, lastReviewDate
   - correctCount, incorrectCount
   - createdAt, updatedAt

8. StudySession
   - id, userId, studySetId (nullable)
   - mode (Flashcard/Learn/Test/Match/Write/Listen)
   - startedAt, endedAt, duration (seconds)
   - totalCards, correctCards, incorrectCards
   - score (percentage)

9. DailyStats
   - id, userId, date (unique per user per day)
   - cardsStudied, cardsCorrect, cardsIncorrect
   - timeSpent (seconds)
   - newCardsSeen, reviewCards
   - streak (current streak count)

10. UserGoal
    - id, userId
    - dailyCardTarget, dailyTimeTarget (minutes)
    - currentStreak, longestStreak
    - lastStudyDate

Tạo prisma migrate dev --name init
Tạo seed script cơ bản (1 user admin)
```

### Task 1.2 — Zod Schemas trong src/schemas/

```
Yêu cầu:
- Tạo Zod schemas tương ứng tất cả models ở Task 1.1
- Schemas cho request/response DTOs:
  - Auth: LoginBody, RegisterBody, TokenResponse, RefreshTokenBody
  - Card: CreateCardBody, UpdateCardBody, CardResponse
  - StudySet: CreateSetBody, UpdateSetBody, SetResponse, SetListResponse
  - Folder: CreateFolderBody, UpdateFolderBody, FolderResponse, FolderTreeResponse
  - Tag: CreateTagBody, TagResponse
  - SRS: ReviewCardBody (rating), SRSDataResponse
  - StudySession: CreateSessionBody, SessionResponse
  - Stats: DailyStatsResponse, DashboardResponse
  - Import: ImportAnkiBody, ImportJSONBody, ImportCSVBody
  - Export: ExportSetResponse
- Export tất cả types bằng z.infer<typeof schema>
```

### Task 1.3 — Auth API (Next.js Route Handlers)

```
Yêu cầu:
- Route Handlers trong src/app/api/auth/:
  - POST /api/auth/register — đăng ký email + password
  - POST /api/auth/login — đăng nhập, thiết lập Access + Refresh Token vào HttpOnly Cookies
  - POST /api/auth/refresh — cấp lại Access Token từ Refresh Token
  - POST /api/auth/logout — xoá cookies auth
  - GET  /api/auth/me — trả về thông tin user hiện tại
- JWT strategy:
  - Access Token: 15 phút (HttpOnly Cookie hoặc Authorization Header)
  - Refresh Token: 7 ngày (HttpOnly Cookie)
- Middleware & Helpers:
  - src/middleware.ts: Next.js middleware bảo vệ các routes yêu cầu đăng nhập
  - src/lib/auth.ts: verifyToken, signToken, hashPassword, comparePassword (bcryptjs)
- Validation: dùng Zod schemas từ src/schemas/auth.ts
```

### Task 1.4 — Auth UI (Next.js App Router)

```
Yêu cầu:
- Trang Login (src/app/(auth)/login/page.tsx):
  - Form email + password (Shadcn UI Input, Button)
  - Validation bằng React Hook Form + Zod
  - Nút "Đăng ký" chuyển sang /register
  - Toast thông báo lỗi/thành công (Sonner)
- Trang Register (src/app/(auth)/register/page.tsx):
  - Form name + email + password + confirm password
- Axios/Fetch interceptor:
  - Tự động đính kèm token hoặc gửi cookies withCredentials
  - Silent token refresh khi gặp lỗi 401
  - Redirect về /login khi session hết hạn
- Zustand auth store (src/stores/useAuthStore.ts):
  - user, isAuthenticated, login(), logout(), fetchCurrentUser()
- Protected routes qua Next.js middleware:
  - Chưa đăng nhập → redirect /login
  - Đã đăng nhập → redirect / (dashboard)
```

### ✅ Checkpoint Phase 1

```
Kiểm tra:
- [ ] Đăng ký tài khoản mới thành công
- [ ] Đăng nhập nhận được auth cookie / token
- [ ] Truy cập trang protected khi chưa login → redirect /login
- [ ] Token hết hạn → tự động refresh → không bị logout
- [ ] GET /api/auth/me trả về thông tin user
- [ ] Dark mode toggle hoạt động trơn tru trên trang login/register
```

---

## 📦 PHASE 2: CRUD Core — Sets, Cards, Folders, Tags

> **Mục tiêu**: Quản lý đầy đủ nội dung học tập qua Next.js Route Handlers và UI

### Task 2.1 — Study Sets API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/sets/:
- GET    /api/sets          — danh sách sets (phân trang, lọc theo folder, search)
- GET    /api/sets/[id]     — chi tiết set + cards
- POST   /api/sets          — tạo set mới
- PATCH  /api/sets/[id]     — sửa set
- DELETE /api/sets/[id]     — xoá set (cascade xoá cards)
- POST   /api/sets/[id]/duplicate — nhân bản set
- POST   /api/sets/merge    — gộp nhiều sets

Query params: page, limit, search, folderId, sortBy, sortOrder
Response bao gồm: cardCount, masteredCount, lastStudiedAt
```

### Task 2.2 — Cards API & Image Upload (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/:
- GET    /api/sets/[setId]/cards — danh sách cards trong set
- POST   /api/sets/[setId]/cards — thêm card vào set
- PATCH  /api/cards/[id]         — sửa card
- DELETE /api/cards/[id]         — xoá card
- POST   /api/cards/[id]/duplicate — nhân bản card
- PATCH  /api/cards/reorder     — sắp xếp lại thứ tự cards
- POST   /api/cards/bulk-tag    — gán tag hàng loạt

Upload ảnh cho card:
- POST /api/cards/[id]/image — upload FormData (Sharp convert → webp → lưu public/uploads/)
- Tự động resize max 800px, nén webp tối ưu dung lượng
```

### Task 2.3 — Folders API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/folders/:
- GET    /api/folders        — cây thư mục (tree structure, nested)
- POST   /api/folders        — tạo folder (hỗ trợ parentId)
- PATCH  /api/folders/[id]   — sửa folder
- DELETE /api/folders/[id]   — xoá folder (move sets ra root hoặc cascade)
- PATCH  /api/folders/[id]/move — di chuyển folder (đổi parentId)

Response dạng tree:
{
  id, name, children: [{ id, name, children: [...] }],
  sets: [{ id, name, cardCount }]
}
```

### Task 2.4 — Tags API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/tags/:
- GET    /api/tags           — danh sách tags (với count cards mỗi tag)
- POST   /api/tags           — tạo tag mới (name, color)
- PATCH  /api/tags/[id]      — sửa tag
- DELETE /api/tags/[id]      — xoá tag (chỉ bỏ liên kết, không xoá cards)
- GET    /api/tags/[id]/cards — danh sách cards có tag này (xuyên sets)

Auto-complete: GET /api/tags/search?q=... — tìm tag theo tên
```

### Task 2.5 — App Layout & Sidebar Navigation

```
Yêu cầu:
- Layout chính: src/app/(dashboard)/layout.tsx
  - Sidebar (collapsible) hiển thị:
    - 📊 Dashboard
    - 📚 Thư viện (Library) — tree folders + sets
    - 📅 Lịch ôn tập (Calendar)
    - 📈 Thống kê (Stats)
    - ⚙️ Cài đặt (Settings)
  - Main content area
  - Top bar: search toàn cục (Ctrl+K), theme toggle, user avatar & menu
- Folder tree trong sidebar:
  - Expand/collapse folders
  - Click set → navigate đến set detail
  - Right-click context menu: rename, delete, move
- Shadcn UI components: Sheet (mobile sidebar), ScrollArea, Collapsible
```

### Task 2.6 — Study Sets Management UI

```
Yêu cầu:
- Trang Library (src/app/(dashboard)/library/page.tsx):
  - Grid/List view các sets (toggle)
  - Mỗi set card hiển thị: name, cardCount, progress %, lastStudied
  - Search bar + filter by folder/tag
  - Nút "Tạo Set mới"
  - Actions: Edit, Delete, Duplicate, Move to folder
- Trang Set Detail (src/app/(dashboard)/sets/[id]/page.tsx):
  - Header: tên set, mô tả, stats summary
  - Danh sách cards dạng bảng (TanStack Table):
    - Columns: Term, Reading, Definition, Tags, SRS Status
    - Inline edit (click to edit)
    - Bulk select → bulk delete / bulk tag
  - Nút thêm card mới (modal form)
  - Các nút Study modes: Flashcard, Learn, Test, Match, Write, Listen
- Modal/Dialog tạo/sửa set (Shadcn UI Dialog)
- Modal tạo/sửa card:
  - Tabs: Cơ bản (Term, Reading, Definition) | Chi tiết (Example, Note, Image) | Kanji (Bộ thủ, Nét...)
  - Image upload drag & drop
  - Tag selector (multi-select with auto-complete)
  - JLPT level selector, Word type selector
```

### Task 2.7 — Folders & Tags Management UI

```
Yêu cầu:
- Folder management:
  - Tạo/sửa/xoá folder trong sidebar
  - Drag & drop di chuyển sets giữa folders
  - Tạo subfolder
- Tag management:
  - Trang /tags hoặc dialog quản lý tags
  - Tạo tag mới (name + color picker)
  - Xem tất cả cards theo tag
  - Gán tag nhanh trong bảng cards
  - Tag auto-complete khi gõ
```

### Task 2.8 — Tìm kiếm toàn cục

```
Yêu cầu:
- API Route Handler: GET /api/search?q=... — tìm trong sets, cards, tags
  - Hỗ trợ search tiếng Nhật (Kanji, Hiragana) và tiếng Việt
  - Kết quả phân loại: Sets | Cards | Tags
- Frontend: Command palette (Cmd+K / Ctrl+K)
  - Shadcn UI Command component
  - Hiển thị kết quả real-time (debounce 300ms)
  - Navigate đến kết quả khi click
```

### ✅ Checkpoint Phase 2

```
Kiểm tra:
- [ ] CRUD Sets hoạt động đầy đủ
- [ ] CRUD Cards hoạt động (bao gồm upload ảnh webp)
- [ ] Folder tree hiển thị đúng, tạo/sửa/xoá/di chuyển
- [ ] Tags: tạo, gán cho card, lọc theo tag, auto-complete
- [ ] Sidebar navigation hoạt động trơn tru
- [ ] Search toàn cục (Ctrl+K) tìm được sets + cards + tags
- [ ] Duplicate set, merge sets hoạt động
- [ ] Responsive layout mượt mà trên desktop
```

---

## 📦 PHASE 3: Study Modes — Flashcard, Learn, Write

> **Mục tiêu**: 3 chế độ học chính và thuật toán Spaced Repetition (SRS) hoạt động

### Task 3.1 — Study Session API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/study/:
- POST /api/study/start — bắt đầu session (setId, mode, options)
  - Options: shuffle, reverse, filterByStatus, filterByTags, limit
  - Trả về danh sách cards theo cấu hình
- POST /api/study/answer — ghi nhận câu trả lời (cardId, isCorrect, userAnswer, timeTaken)
- POST /api/study/end — kết thúc session, lưu StudySession record
- GET  /api/study/mistakes — lấy danh sách cards đã sai (Error Pool)
- POST /api/study/review-mistakes — bắt đầu session ôn lại lỗi sai
```

### Task 3.2 — SRS Engine & Due Cards API

```
Yêu cầu — Module src/lib/srs/ với 3 chế độ SRS:

1. Automatic Mode (mặc định):
   - Dựa trên SM-2 nhưng tự động thích ứng
   - Đánh giá dựa trên: isCorrect, timeTaken, số lần sai
   - Quy tắc:
     - Đúng < 5s → Easy → interval * 2.5
     - Đúng 5-15s → Good → interval * 2.0
     - Đúng > 15s → Hard → interval * 1.2
     - Sai → Again → interval = 1 ngày

2. Simple Mode (kiểu Quizlet):
   - User tự đánh giá: Repeat / Hard / Okay / Easy
   - Mapping sang interval: 0 / 1 / 3 / 7 ngày

3. Advanced Mode (SM-2 đầy đủ):
   - Thuật toán SuperMemo-2 chính xác
   - Quality 0-5
   - EF = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))

Route Handlers:
- POST /api/srs/review — submit review (cardId, rating/auto)
- GET  /api/srs/due-cards — lấy cards cần ôn hôm nay
- GET  /api/srs/due-count — đếm số cards cần ôn (cho calendar)
- GET  /api/srs/card-status/[cardId] — trạng thái SRS của card
```

### Task 3.3 — Flashcard Mode UI

```
Yêu cầu:
- Route: src/app/(dashboard)/study/[setId]/flashcard/page.tsx
- Giao diện:
  - Card lớn ở giữa màn hình
  - Flip animation 3D khi click hoặc ấn Space
  - Mặt trước: Term + Reading (furigana)
  - Mặt sau: Definition + Example + Image (nếu có)
  - Nút phát âm (TTS Web Speech API)
  - Nút: ← Trước | Lật | Sau →
  - Nút phân loại: ❌ Chưa biết | ✅ Biết rồi
  - Thanh tiến độ: x / total
  - Nút Shuffle, Reverse toggle
- Tính năng:
  - Keyboard shortcuts: Space (flip), ←→ (navigate), 1 (chưa biết), 2 (biết)
  - Auto-play mode: tự lật + phát âm + chuyển thẻ
  - Kết thúc: hiển thị summary (đúng/sai/%, thời gian)
  - Tự động lưu StudySession khi hoàn tất
```

### Task 3.4 — Learn Mode UI

```
Yêu cầu:
- Route: src/app/(dashboard)/study/[setId]/learn/page.tsx
- Giao diện:
  - Hiển thị câu hỏi (adaptive, xen kẽ các dạng):
    - Multiple Choice: 4 lựa chọn ngẫu nhiên từ set
    - True/False: hiển thị term + definition, đúng hay sai?
    - Written: gõ đáp án (với hint sau 2 lần sai)
  - Reverse mode: hỏi ngược định nghĩa → từ vựng
  - Feedback tức thì: animation đúng ✅ (xanh) / sai ❌ (đỏ)
  - Hiển thị đáp án đúng khi trả lời sai
  - Progress bar: % hoàn thành
  - Thẻ làm sai sẽ xuất hiện lặp lại trong phiên
- Kết thúc: summary + lưu session + cập nhật SRS
```

### Task 3.5 — Write Mode UI

```
Yêu cầu:
- Route: src/app/(dashboard)/study/[setId]/write/page.tsx
- Giao diện:
  - Hiển thị Definition (hoặc Term nếu reverse)
  - Input field để gõ đáp án tiếng Nhật (hỗ trợ IME)
  - Kiểm tra chính tả chính xác
  - Sau 2 lần sai: hiển thị hint (ký tự đầu)
  - Sau 3 lần sai: hiển thị đáp án + đánh dấu sai
  - Nút override: "Đáp án của tôi đúng" (cho trường hợp đồng nghĩa)
- Kết thúc: summary + lưu session
```

### Task 3.6 — Review Mistakes UI ⭐

```
Yêu cầu:
- Route: src/app/(dashboard)/study/mistakes/page.tsx
- Giao diện:
  - Error Pool: hiển thị tất cả thẻ đã từng trả lời sai
  - Thống kê: mỗi thẻ sai bao nhiêu lần, lần cuối sai khi nào
  - Sắp xếp: theo tần suất sai nhiều nhất
  - Nút "Ôn lại tất cả" → bắt đầu session tập trung thẻ sai
  - Tuỳ chọn mode ôn: Flashcard / Learn / Write
  - Khi trả lời đúng 3 lần liên tiếp → tự động gỡ khỏi Error Pool
```

### ✅ Checkpoint Phase 3

```
Kiểm tra:
- [ ] Flashcard mode: flip 3D, navigate, shuffle, reverse, TTS, shortcuts
- [ ] Learn mode: multiple choice, true/false, written, adaptive
- [ ] Write mode: type answer, hint, override, IME support
- [ ] SRS engine: 3 chế độ hoạt động, tính interval chính xác
- [ ] Review mistakes: thu thập lỗi sai, ôn tập tập trung
- [ ] StudySession được lưu đầy đủ vào PostgreSQL
```

---

## 📦 PHASE 4: Study Modes — Test, Match, Listen

> **Mục tiêu**: Hoàn thiện toàn bộ 6 chế độ học tập

### Task 4.1 — Test Mode UI

```
Yêu cầu:
- Route: src/app/(dashboard)/study/[setId]/test/page.tsx
- Cấu hình trước khi bắt đầu (dialog):
  - Số câu hỏi (10 / 20 / 50 / tất cả)
  - Tỷ lệ dạng câu: Trắc nghiệm / Đúng sai / Điền từ / Ghép từ
  - Giới hạn thời gian: Không giới hạn / 10p / 20p / 30p
  - Chế độ Reverse
- Giao diện:
  - Danh sách câu hỏi hoặc tuần tự từng câu
  - Timer countdown
  - Progress bar
  - Nút "Nộp bài" và xác nhận
- Kết quả:
  - Điểm số (x/total, %)
  - Chi tiết từng câu đúng/sai kèm lời giải
  - So sánh với lần làm bài trước
  - Nút "Làm lại" / "Ôn lại câu sai"
```

### Task 4.2 — Match Mode UI

```
Yêu cầu:
- Route: src/app/(dashboard)/study/[setId]/match/page.tsx
- Giao diện:
  - Lưới các ô chứa Terms và Definitions được xáo trộn
  - Click 2 ô để ghép đôi (hoặc drag & drop)
  - Hiệu ứng: ghép đúng → fade out biến mất; ghép sai → shake rung lắc
  - Đồng hồ bấm giờ đếm lên
  - Đếm số cặp còn lại
- Kết thúc:
  - Thời gian hoàn thành
  - So sánh với kỷ lục cá nhân (personal best)
  - Lưu best time vào database
```

### Task 4.3 — Listening Mode UI

```
Yêu cầu:
- Route: src/app/(dashboard)/study/[setId]/listen/page.tsx
- Giao diện:
  - Phát âm tiếng Nhật (Web Speech API, voice ja-JP)
  - Tốc độ phát lại: 0.5x / 1x / 1.5x
  - Input field để gõ lại những gì nghe được
  - Kiểm tra độ chính xác (Hiragana/Katakana/Kanji)
  - Hint sau 2 lần nghe sai
  - Hiển thị đáp án đúng
- Kết thúc: summary + lưu session
```

### Task 4.4 — Mode Selection Screen

```
Yêu cầu:
- Khi bấm "Học" trên Set Detail:
  - Modal hoặc trang chọn chế độ học (src/app/(dashboard)/study/[setId]/page.tsx)
  - 6 thẻ lớn tương ứng 6 modes:
    - 🃏 Flashcard — "Lật thẻ ôn tập"
    - 📖 Learn — "Học thích ứng"
    - 📝 Test — "Kiểm tra"
    - 🧩 Match — "Ghép đôi"
    - ✍️ Write — "Viết đáp án"
    - 🎧 Listen — "Nghe & viết"
  - Options chung: Shuffle, Reverse, Lọc theo SRS status, Lọc theo tags
```

### ✅ Checkpoint Phase 4

```
Kiểm tra:
- [ ] Test mode: cấu hình, timed, nhiều dạng câu, chấm điểm
- [ ] Match mode: ghép đôi, timer, animation mượt mà
- [ ] Listen mode: TTS phát âm, gõ lại, check chính xác
- [ ] Mode selection screen hiển thị đẹp, điều hướng chính xác
- [ ] Toàn bộ 6 modes đều lưu StudySession đầy đủ
```

---

## 📦 PHASE 5: Dashboard, Statistics & Calendar

> **Mục tiêu**: Bảng điều khiển theo dõi tiến độ, biểu đồ phân tích và lịch học tập

### Task 5.1 — Statistics API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/stats/:
- GET /api/stats/dashboard — tổng quan hôm nay (cardsStudied, accuracy, timeSpent, streak, goals)
- GET /api/stats/daily?from=&to= — thống kê theo ngày (cho biểu đồ Recharts)
- GET /api/stats/heatmap?year= — dữ liệu heat map 365 ngày
- GET /api/stats/sessions?page= — lịch sử các phiên học
- GET /api/stats/weekly-summary — tóm tắt hiệu suất tuần
- GET /api/stats/export — export báo cáo thống kê dạng JSON
```

### Task 5.2 — Calendar API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/calendar/:
- GET /api/calendar/due?month=&year= — số lượng cards cần ôn mỗi ngày trong tháng
- GET /api/calendar/today — chi tiết danh sách cards đến hạn ôn tập hôm nay
```

### Task 5.3 — Daily Goals API (Route Handlers)

```
Yêu cầu — Route Handlers trong src/app/api/goals/:
- GET   /api/goals — lấy mục tiêu học tập hiện tại
- PATCH /api/goals — cập nhật mục tiêu (dailyCardTarget, dailyTimeTarget)
- GET   /api/goals/progress — tính toán tiến độ hôm nay
- Logic cập nhật streak hàng ngày tự động
```

### Task 5.4 — Dashboard Page UI

```
Yêu cầu:
- Route: src/app/(dashboard)/dashboard/page.tsx (hoặc src/app/(dashboard)/page.tsx)
- Giao diện:
  - Header chào mừng cá nhân hoá + streak badge 🔥
  - 4 thẻ tóm tắt: Thẻ đã học hôm nay | Tỷ lệ đúng | Thời gian học | Chuỗi streak
  - Danh sách "Cần ôn tập hôm nay" với nút "Ôn ngay"
  - Biểu đồ Recharts:
    - Line chart: số thẻ học 7 ngày qua
    - Bar chart: độ chính xác theo từng mode
  - Thanh tiến độ mục tiêu hàng ngày
  - Lịch sử 5 phiên học gần nhất
```

### Task 5.5 — Statistics Page UI

```
Yêu cầu:
- Route: src/app/(dashboard)/stats/page.tsx
- 3 Tabs: Tổng quan | Chi tiết | Lịch sử
- Tab Tổng quan:
  - Heat map 365 ngày kiểu GitHub
  - Streak tracker và biểu đồ dài hạn
- Tab Chi tiết:
  - Lọc theo tuần / tháng / năm / theo bộ thẻ
  - Pie chart phân bố trạng thái SRS (New / Learning / Review / Mastered)
  - Bar chart top 10 sets được học nhiều nhất
- Tab Lịch sử:
  - Bảng phiên học (TanStack Table) có phân trang, lọc, sắp xếp
```

### Task 5.6 — Calendar Page UI

```
Yêu cầu:
- Route: src/app/(dashboard)/calendar/page.tsx
- Giao diện:
  - Calendar view cả tháng
  - Mỗi ngày hiển thị badge số cards due với màu trạng thái (xanh/đỏ/xám)
  - Click vào ngày → xem danh sách thẻ và nút "Bắt đầu ôn"
  - Dự báo số thẻ đến hạn trong 7 ngày tới
```

### ✅ Checkpoint Phase 5

```
Kiểm tra:
- [ ] Dashboard hiển thị đầy đủ thông số hôm nay
- [ ] Heat map 365 ngày hoạt động chuẩn xác
- [ ] Streak tracking tự động tính toán đúng
- [ ] Biểu đồ Recharts render đẹp mắt, không lỗi layout
- [ ] Calendar view hiển thị đúng due cards theo từng ngày
- [ ] Daily goals cập nhật tiến độ real-time
```

---

## 📦 PHASE 6: Import / Export

> **Mục tiêu**: Import Anki (.apkg), JSON, CSV; Export JSON; Backup & Restore

### Task 6.1 — Anki (.apkg) Import API (Route Handler)

```
Yêu cầu:
- Route Handler: POST /api/import/anki
- Logic:
  - File .apkg là archive ZIP chứa SQLite database
  - Giải nén với adm-zip → đọc SQLite bằng better-sqlite3 / sql.js
  - Trích xuất cards, notes, decks, fields
  - Mapping dữ liệu sang format StudySet & Card của NihoMemo
  - Xử lý media kèm theo (ảnh, âm thanh)
- Preview endpoint:
  - POST /api/import/anki/preview — đọc cấu trúc và trả về mẫu để người dùng map cột trước khi lưu
```

### Task 6.2 — JSON & CSV Import API (Route Handlers)

```
Yêu cầu:
- POST /api/import/json — import file JSON NihoMemo format
- POST /api/import/csv — import file CSV/TSV
  - Tự động nhận diện delimiter (, \t ;)
  - Nhận diện dòng header
- POST /api/import/text — import plain text (dạng Term - Definition)
- Hỗ trợ preview và gán tag hàng loạt trước khi import
```

### Task 6.3 — Export & Backup API (Route Handlers)

```
Yêu cầu:
- GET  /api/export/set/[id] — export 1 set ra file JSON
- GET  /api/export/all — export toàn bộ sets ra JSON
- GET  /api/export/backup — backup toàn bộ database (sets, cards, SRS, stats, settings)
- POST /api/import/restore — restore toàn bộ dữ liệu từ file backup
```

### Task 6.4 — Import/Export UI

```
Yêu cầu:
- Route: src/app/(dashboard)/import-export/page.tsx
- Giao diện:
  - Tabs: Anki (.apkg) | JSON | CSV | Text
  - Vùng kéo thả file upload (drag & drop)
  - Bảng xem trước dữ liệu (preview table)
  - Giao diện mapping trường dữ liệu
  - Thanh tiến trình import (progress bar)
- Section Backup & Restore:
  - Nút tải về bản backup
  - Nút phục hồi dữ liệu từ file backup có confirm dialog
```

### ✅ Checkpoint Phase 6

```
Kiểm tra:
- [ ] Import deck Anki (.apkg) thực tế thành công
- [ ] Import CSV và JSON tạo cards chính xác
- [ ] Bảng preview hiển thị đúng trước khi xác nhận import
- [ ] Export set ra JSON chuẩn cấu trúc
- [ ] Full backup và restore dữ liệu toàn vẹn
```

---

## 📦 PHASE 7: Settings, Keyboard Shortcuts & Polish

> **Mục tiêu**: Cài đặt tài khoản, phím tắt tuỳ chỉnh, TTS, tối ưu UX toàn diện

### Task 7.1 — Settings Page UI

```
Yêu cầu:
- Route: src/app/(dashboard)/settings/page.tsx
- Các nhóm cài đặt:
  1. Hồ sơ: Tên hiển thị, avatar, đổi mật khẩu
  2. Giao diện: Theme sáng/tối/hệ thống, kích cỡ font chữ
  3. Học tập: Chế độ SRS mặc định, mục tiêu ngày, auto-play, tốc độ TTS
  4. Phím tắt: Bảng tuỳ biến phím tắt
  5. Dữ liệu: Nhanh chóng sao lưu và xuất dữ liệu
- Lưu cài đặt vào trường User.settings trong PostgreSQL
```

### Task 7.2 — Keyboard Shortcuts System

```
Yêu cầu:
- Phím tắt mặc định:
  - Space: Lật thẻ / Xác nhận
  - ← →: Thẻ trước / sau
  - 1: Chưa biết / Repeat
  - 2: Biết rồi / Easy
  - 3: Khó (Hard)
  - 4: Tốt (Good)
  - S: Shuffle trộn ngẫu nhiên
  - R: Reverse lật ngược
  - Ctrl+K: Mở tìm kiếm toàn cục
  - ?: Mở modal cheatsheet phím tắt
- Custom hook: src/hooks/useKeyboardShortcuts.ts
- Cho phép bấm đổi phím tắt trong trang Settings
```

### Task 7.3 — Text-to-Speech (TTS) hoàn chỉnh

```
Yêu cầu:
- Sử dụng Web Speech API với voice tiếng Nhật ja-JP
- Tuỳ chỉnh tốc độ phát âm (0.5x đến 2.0x)
- Custom hook: src/hooks/useTTS.ts
- Nút phát âm trên từng thẻ học và trong các study modes
- Hỗ trợ auto-play khi lật thẻ
```

### Task 7.4 — UI/UX Polish

```
Yêu cầu:
- Skeletons loading (Shadcn Skeleton) cho tất cả các trang
- Empty states thân thiện khi chưa có dữ liệu
- Toasts thông báo (Sonner) cho mọi hành động CRUD
- Confirm dialogs bảo vệ trước khi xoá dữ liệu
- Optimistic updates cho trải nghiệm học tập tức thì
```

### ✅ Checkpoint Phase 7

```
Kiểm tra:
- [ ] Trang Settings lưu và tải cấu hình đúng
- [ ] Phím tắt hoạt động mượt mà trong tất cả study modes
- [ ] TTS phát âm tiếng Nhật chuẩn xác
- [ ] Loading skeletons và empty states hiển thị đẹp mắt
- [ ] Toast thông báo và confirm dialogs hoạt động đúng
```

---

## 📦 PHASE 8: Seed Data & Testing

> **Mục tiêu**: Dữ liệu mẫu Minna no Nihongo N5-N4, kiểm thử tự động, tối ưu hiệu năng

### Task 8.1 — Seed Data: Minna no Nihongo

```
Yêu cầu:
- Script prisma/seed.ts:
  - User admin mặc định
  - Cấu trúc thư mục: Minna no Nihongo (N5 Bài 1-25, N4 Bài 26-50), Kanji N5/N4
  - Tạo các sets từ vựng mẫu với đầy đủ furigana, nghĩa, ví dụ, kanji
  - Seed dữ liệu SRS, study sessions và daily stats mẫu (30 ngày)
```

### Task 8.2 — Unit Tests

```
Yêu cầu (Vitest):
- Auth logic: verifyToken, hashPassword
- Route Handlers / Services: CRUD sets, cards, folders, tags
- SRS Engine: test 3 thuật toán (Auto, Simple, SM-2)
- Parsers: Anki .apkg, CSV, JSON parsers
- Coverage target: >= 80%
```

### Task 8.3 — E2E Tests (Playwright)

```
Yêu cầu:
- Auth flow: Đăng ký → Đăng nhập → Protected routes → Đăng xuất
- Study flow: Tạo bộ thẻ → Học Flashcard → Cập nhật SRS
- Import flow: Upload file → Xem trước → Hoàn tất import
- Dashboard flow: Kiểm tra cập nhật thống kê sau khi học
```

### Task 8.4 — Bug Fixes & Performance Optimization

```
Yêu cầu:
- Next.js build test: next build không phát sinh lỗi
- Tối ưu truy vấn Prisma (chỉ select trường cần thiết)
- Tối ưu kích thước bundle, code splitting
- Đảm bảo font tiếng Nhật hiển thị chuẩn xác trên mọi trình duyệt
```

### ✅ Checkpoint Phase 8 (FINAL)

```
Kiểm tra:
- [ ] Seed data chạy thành công, app có đầy đủ dữ liệu mẫu
- [ ] Unit tests pass >= 80% coverage
- [ ] E2E tests pass
- [ ] Next.js build thành công (pnpm build) không lỗi
- [ ] Toàn bộ 6 study modes hoạt động hoàn hảo
- [ ] Dark/Light mode thẩm mỹ, đạt tiêu chuẩn chất lượng cao
```

---

## 📋 Tóm tắt Phases

| Phase | Tên                            | Ước lượng | Mô tả                                                   |
| :---: | :----------------------------- | :-------: | :------------------------------------------------------ |
|   0   | Khởi tạo & Hạ tầng             |    ⏱️     | Next.js App Router, Tailwind v4, Shadcn, Docker, Prisma |
|   1   | Auth & DB Schema               |    ⏱️     | Login/Register, JWT Cookies, 10 Prisma models           |
|   2   | CRUD Core                      |   ⏱️⏱️    | Sets, Cards, Folders, Tags, Search                      |
|   3   | Study: Flashcard, Learn, Write |   ⏱️⏱️    | 3 study modes + SRS engine + Review mistakes            |
|   4   | Study: Test, Match, Listen     |   ⏱️⏱️    | 3 study modes còn lại                                   |
|   5   | Dashboard & Statistics         |   ⏱️⏱️    | Dashboard, Charts, Calendar, Goals                      |
|   6   | Import / Export                |   ⏱️⏱️    | Anki .apkg, JSON, CSV, Backup/Restore                   |
|   7   | Settings & Polish              |    ⏱️     | Settings, Shortcuts, TTS, UX polish                     |
|   8   | Seed Data & Testing            |    ⏱️     | Sample data, Unit tests, E2E, Next.js build             |

---

> **Lưu ý quan trọng cho AI thực hiện**:
>
> 1. Luôn đọc file `func.md` trước khi bắt đầu mỗi Phase
> 2. Tạo commit message rõ ràng bằng tiếng Việt sau mỗi Task / Phase
> 3. Kiểm tra TypeScript (`pnpm tsc --noEmit`) sau mỗi thay đổi lớn
> 4. Test thủ công trên trình duyệt sau mỗi Checkpoint
> 5. Nếu gặp vấn đề hoặc yêu cầu chưa rõ, dừng lại và hỏi user trước khi tiếp tục
