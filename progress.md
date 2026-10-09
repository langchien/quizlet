# 📋 NihoMemo — Bảng theo dõi tiến độ

> Cập nhật lần cuối: 2026-10-09

|  #  | Phase | Task                            | Mô tả                                                                                              | Trạng thái |
| :-: | :---: | :------------------------------ | :------------------------------------------------------------------------------------------------- | :--------: |
| 0.1 |   0   | Khởi tạo Next.js App Router     | Next.js 16+, React 19, TypeScript, Tailwind v4, ESLint, Prettier                                   |     ✅     |
| 0.2 |   0   | Setup UI & Design System        | Shadcn UI, Dark/Light Theme, Font Noto Sans JP, Lucide Icons, Sonner                               |     ✅     |
| 0.3 |   0   | Docker & Database Setup         | PostgreSQL 15 (port 54321) + Prisma 7 (@prisma/adapter-pg) + Model User cơ bản                     |     ✅     |
| 0.4 |   0   | Schemas, Types & State          | Zod schemas, Enums JLPT/WordType/SRS, Zustand store, Axios/Fetch client                            |     ✅     |
| 0.5 |   0   | Health Check & Env Validation   | GET `/api/health` Route Handler, Env validation bằng Zod                                           |     ✅     |
|     |       | **✅ Checkpoint 0**             | **Next.js chạy thành công, kết nối DB Prisma OK, UI Shadcn + Dark mode OK**                        |     ✅     |
| 1.1 |   1   | Prisma Schema đầy đủ            | 10 models: User, Folder, StudySet, Card, Tag, CardTag, SRSData, StudySession, DailyStats, UserGoal |     ✅     |
| 1.2 |   1   | Zod Schemas & Types             | DTOs cho Auth, Card, Set, Folder, Tag, SRS, Session, Stats, Import/Export trong `src/schemas`      |     ✅     |
| 1.3 |   1   | Auth API (Route Handlers)       | Register, Login, Refresh, Logout, /me — JWT Access + Refresh (HttpOnly Cookies)                    |     ✅     |
| 1.4 |   1   | Auth UI (App Router)            | Login/Register pages, Axios interceptor, Zustand auth store, Middleware route guards               |     ✅     |
|     |       | **✅ Checkpoint 1**             | **Đăng ký → Đăng nhập → Protected routes → Auto refresh token**                                    |     ✅     |
| 2.1 |   2   | Study Sets API (Route Handlers) | GET/POST/PATCH/DELETE sets + duplicate + merge                                                     |     ✅     |
| 2.2 |   2   | Cards API (Route Handlers)      | GET/POST/PATCH/DELETE cards + upload ảnh (Sharp → webp) + bulk tag + reorder                       |     ✅     |
| 2.3 |   2   | Folders API (Route Handlers)    | Tree structure, nested folders, move                                                               |     ✅     |
| 2.4 |   2   | Tags API (Route Handlers)       | CRUD tags + auto-complete search + cards by tag                                                    |     ✅     |
| 2.5 |   2   | Sidebar & Navigation (UI)       | App layout, collapsible sidebar, folder tree, top bar search, theme toggle                         |     ✅     |
| 2.6 |   2   | Sets Management (UI)            | Library page (grid/list), Set detail (TanStack Table), Create/Edit card modal                      |     ✅     |
| 2.7 |   2   | Folders & Tags (UI)             | Folder CRUD trong sidebar, Tag management, gán tag nhanh                                           |     ✅     |
| 2.8 |   2   | Tìm kiếm toàn cục               | API: search xuyên sets/cards/tags — UI: Command palette (Ctrl+K)                                   |     ✅     |
|     |       | **✅ Checkpoint 2**             | **CRUD Sets/Cards/Folders/Tags OK, Search OK, Sidebar OK**                                         |     ✅     |
| 3.1 |   3   | Study Session API               | Route Handlers: Start/Answer/End session, Mistakes pool, Review mistakes                           |     ✅     |
| 3.2 |   3   | SRS Engine                      | Core logic: 3 chế độ Auto / Simple (Quizlet) / Advanced (SM-2) + Due cards API                     |     ✅     |
| 3.3 |   3   | Flashcard Mode (UI)             | Flip 3D, shuffle, reverse, TTS, keyboard shortcuts, auto-play, summary                             |     ✅     |
| 3.4 |   3   | Learn Mode (UI)                 | Adaptive: MC + TF + Written, thẻ sai quay lại, progress bar                                        |     ✅     |
| 3.5 |   3   | Write Mode (UI)                 | Gõ đáp án, check chính tả, hint, IME tiếng Nhật, override                                          |     ✅     |
| 3.6 |   3   | Review Mistakes (UI) ⭐         | Error Pool, thống kê tần suất sai, ôn tập tập trung vào lỗi sai                                    |     ✅     |
|     |       | **✅ Checkpoint 3**             | **Flashcard + Learn + Write + SRS + Review Mistakes hoạt động**                                    |     ✅     |
| 4.1 |   4   | Test Mode (UI)                  | Cấu hình (số câu, dạng, timed), chấm điểm, so sánh với lần trước                                   |     ✅     |
| 4.2 |   4   | Match Mode (UI)                 | Ghép đôi drag & drop, timer, animation, personal best                                              |     ✅     |
| 4.3 |   4   | Listening Mode (UI)             | TTS phát âm → gõ lại, tốc độ 0.5x/1x/1.5x, hint                                                    |     ✅     |
| 4.4 |   4   | Mode Selection Screen           | 6 cards chọn mode, options chung (shuffle, reverse, filter)                                        |     ✅     |
|     |       | **✅ Checkpoint 4**             | **Tất cả 6 study modes hoạt động, lưu session**                                                    |     ✅     |
| 5.1 |   5   | Statistics API                  | Route Handlers: Dashboard, daily stats, heatmap, sessions history, export                          |     ✅     |
| 5.2 |   5   | Calendar API                    | Route Handlers: Due cards theo tháng, chi tiết cards cần ôn hôm nay                                |     ✅     |
| 5.3 |   5   | Daily Goals API                 | Route Handlers: CRUD goals, progress tracking, streak logic                                        |     ✅     |
| 5.4 |   5   | Dashboard Page (UI)             | Stats hôm nay, cần ôn tập, biểu đồ Recharts, mục tiêu, recent sessions                             |     ✅     |
| 5.5 |   5   | Statistics Page (UI)            | Heat map 365 ngày, biểu đồ chi tiết, lịch sử sessions (TanStack Table)                             |     ✅     |
| 5.6 |   5   | Calendar Page (UI)              | Calendar view tháng, due cards badge, click → chi tiết + bắt đầu ôn                                |     ✅     |
|     |       | **✅ Checkpoint 5**             | **Dashboard + Stats + Calendar + Goals + Heat map hoạt động**                                      |     ✅     |
| 6.1 |   6   | Anki Import API                 | Route Handler: Upload .apkg → giải nén ZIP → đọc SQLite → parse + mapping → tạo cards              |     ✅     |
| 6.2 |   6   | JSON & CSV Import API           | Route Handler: Import JSON/CSV/Text + auto-detect + field mapping + preview                        |     ✅     |
| 6.3 |   6   | Export & Backup API             | Route Handler: Export set JSON, full backup, restore từ backup                                     |     ✅     |
| 6.4 |   6   | Import/Export UI                | Upload drag & drop, preview bảng, field mapping, progress bar                                      |     ✅     |
|     |       | **✅ Checkpoint 6**             | **Import .apkg/JSON/CSV OK, Export JSON OK, Backup/Restore OK**                                    |     ✅     |
| 7.1 |   7   | Settings Page (UI)              | Hồ sơ, giao diện, SRS mode, goals, phím tắt, dữ liệu                                               |     ✅     |
| 7.2 |   7   | Keyboard Shortcuts              | Default shortcuts + tuỳ chỉnh trong Settings + cheatsheet modal                                    |     ✅     |
| 7.3 |   7   | TTS hoàn chỉnh                  | Web Speech API, voice ja-JP, tốc độ tuỳ chỉnh, auto-play                                           |     ✅     |
| 7.4 |   7   | UI/UX Polish                    | Skeletons, empty states, error states, toasts, confirm dialogs, optimistic updates                 |     ✅     |
|     |       | **✅ Checkpoint 7**             | **Settings + Shortcuts + TTS + UX mượt mà**                                                        |     ✅     |
| 8.1 |   8   | Seed Data                       | Minna no Nihongo N5-N4 mẫu, SRS data, sessions, stats 30 ngày                                      |     ✅     |
| 8.2 |   8   | Unit Tests                      | Vitest cho APIs, SRS algorithms, Import parsers — Coverage ≥ 80%                                   |     ✅     |
| 8.3 |   8   | E2E Tests                       | Playwright: Auth flow, Study flow, Import flow, Stats flow                                         |     ✅     |
| 8.4 |   8   | Bug Fixes & Perf                | Next.js build opt, SSR/CSR opt, Prisma query opt, font tiếng Nhật                                  |     ✅     |
|     |       | **✅ Checkpoint 8**             | **🎉 App hoàn chỉnh, tests pass, performance OK**                                                  |     ✅     |

---

**Ký hiệu trạng thái:**

- ⬜ Chưa bắt đầu
- 🔄 Đang thực hiện
- ✅ Hoàn thành
- ⚠️ Có vấn đề cần xử lý
- ⏭️ Bỏ qua
