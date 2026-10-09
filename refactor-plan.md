# 📋 Kế Hoạch Chi Tiết Refactor Component & Custom Hooks — Dự Án NihoMemo

> **Mục tiêu**: Tối ưu hóa cấu trúc mã nguồn, chia nhỏ toàn bộ các "God Components" (các component > 300 dòng) thành các **Custom Hooks** chuyên trách nghiệp vụ và các **Sub-components** nhỏ gọn, tuân thủ nguyên tắc **Single Responsibility**, dễ kiểm soát, tăng khả năng tái sử dụng, cải thiện hiệu năng render và thuận tiện cho việc kiểm thử (unit test/component test).
> **Tiêu chuẩn kỹ thuật bắt buộc**:
> - Tuân thủ [Vercel Composition Patterns](file:///.agents/skills/vercel-composition-patterns/SKILL.md) & [Vercel React Best Practices](file:///.agents/skills/vercel-react-best-practices/SKILL.md).
> - Chuẩn giao diện [Shadcn UI](file:///.agents/skills/shadcn/SKILL.md) & [Tailwind CSS v4](file:///.agents/skills/tailwind-4-docs/SKILL.md).
> - React 19 & Next.js 16 App Router (Strict TypeScript, Server Actions, Zod validation).
> - Ngôn ngữ tài liệu & comment: **Tiếng Việt**.

---

## 📊 I. Thống Kê & Phân Loại Các Component Dài Cần Refactor

Dưới đây là danh sách toàn bộ các file giao diện nghiệp vụ vượt ngưỡng dòng khuyến nghị (> 300 dòng) được phân loại theo mức độ ưu tiên:

| STT | Đường dẫn File | Số dòng hiện tại | Mức độ ưu tiên | Trách nhiệm chính hiện tại | Hướng giải quyết chính |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **1** | [`src/app/(dashboard)/import-export/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/import-export/page.tsx) | **1,880** | 🔥 Cực cao (P0) | Quản lý 5 luồng Import (Anki, CSV, Text, JSON), Export đa định dạng, Full Backup & Restore, 2 dialogs xác nhận. | Tách 6 Custom Hooks theo từng định dạng + 8 Sub-components theo tab & dialog. |
| **2** | [`src/app/(dashboard)/study/[setId]/test/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/test/page.tsx) | **1,255** | 🔥 Cực cao (P0) | 3 giai đoạn bài thi (Config, Testing, Result), bộ đếm giờ, chấm điểm trực tiếp, sinh câu hỏi MCQ/TF/Written, lưu kỷ lục. | Tách hook `useTestEngine` điều phối máy trạng thái + Sub-components cho từng pha & loại câu hỏi. |
| **3** | [`src/app/(dashboard)/stats/stats-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/stats/stats-client.tsx) | **966** | ⚡ Rất cao (P1) | 4 tabs phân tích, biểu đồ Recharts (Area, Bar, Pie), Heatmap 52 tuần, lịch sử phiên học có phân trang & filter. | Tách hook `useStatsFilter` + Sub-components cho Overview, Analytics, Heatmap, Sessions Table. |
| **4** | [`src/app/(dashboard)/settings/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/settings/page.tsx) | **926** | ⚡ Rất cao (P1) | 5 tabs: Thông tin cá nhân, Mật khẩu, Giao diện/Font, Cấu hình SRS & Mục tiêu ngày, TTS voice, Danger zone. | Tách 3 hooks nghiệp vụ + Sub-components cho từng nhóm cấu hình độc lập. |
| **5** | [`src/app/(dashboard)/sets/[id]/set-detail-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/sets/[id]/set-detail-client.tsx) | **849** | ⚡ Rất cao (P1) | Chi tiết bộ thẻ, bảng danh sách thẻ, tìm kiếm, chọn nhiều thẻ, bulk actions (xoá, gắn tag), phát âm, modal triggers. | Tách hook `useSetCardOperations` + Sub-components Header, Toolbar, CardsTable, CardRow, Modals. |
| **6** | [`src/app/(dashboard)/study/[setId]/flashcard/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/flashcard/page.tsx) | **766** | ⚡ Rất cao (P1) | Quản lý phiên Flashcard, 3D flip card, đảo mặt, auto-play, fullscreen, phím tắt điều hướng, SRS rating buttons. | Tách hook `useFlashcardSession`, `useFlashcardKeybindings` + Sub-components Header, Viewer, Actions. |
| **7** | [`src/app/(dashboard)/dashboard/dashboard-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/dashboard/dashboard-client.tsx) | **730** | ⚡ Rất cao (P1) | Trang chủ: Streak flame, 4 KPI cards, Daily goal & progress dialog, ôn tập nhanh SRS, chart 7 ngày, recent sets/sessions. | Tách hook `useDailyGoal` + Sub-components WelcomeBanner, KpiGrid, GoalCard, ActivityChart, RecentSets. |
| **8** | [`src/app/(dashboard)/study/[setId]/learn/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/learn/page.tsx) | **699** | ⚡ Rất cao (P1) | Adaptive learning: Hàng đợi câu hỏi, sinh câu hỏi ngẫu nhiên (MCQ/TF/Written), hiển thị feedback đúng/sai, retry thẻ sai. | Tách hook `useLearnSession` + Sub-components Header, QuestionCard, MCQ, TF, Written, FeedbackView. |
| **9** | [`src/components/modals/create-card-modal.tsx`](file:///p:/Nodejs/quizlet/apps/src/components/modals/create-card-modal.tsx) | **670** | ⚡ Rất cao (P1) | Form tạo/sửa thẻ: Tab cơ bản, Tab Kanji chuyên sâu, Tab Media & Tags, upload ảnh, tạo tag nhanh. | Tách hook `useCardForm` + Sub-components BasicTab, KanjiTab, MediaTagsTab. |
| **10** | [`src/app/(dashboard)/library/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/library/page.tsx) | **603** | 🟡 Cao (P2) | Quản lý thư viện: Grid/List view, tìm kiếm, lọc theo folder, sắp xếp, nhân bản set, xoá set với dialog. | Tách hook `useLibrarySets` + Sub-components Toolbar, GridView, ListView, SetCard, DeleteDialog. |
| **11** | [`src/app/(dashboard)/calendar/calendar-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/calendar/calendar-client.tsx) | **595** | 🟡 Cao (P2) | Lịch ôn tập SRS: Lưới tháng, tính mật độ thẻ due, popover/sheet xem danh sách thẻ và bắt đầu ôn tập theo ngày. | Tách hook `useCalendarSRS` + Sub-components CalendarHeader, CalendarGrid, DayCell, DayDetailSheet. |
| **12** | [`src/app/(dashboard)/study/[setId]/listen/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/listen/page.tsx) | **583** | 🟡 Cao (P2) | Luyện nghe: TTS Web Speech, nút chỉnh tốc độ (0.75x, 1x), nhập đáp án, fuzzy match, xem gợi ý Furigana, feedback. | Tách hook `useListenSession` + Sub-components Header, AudioPlayerCard, InputForm, FeedbackView. |
| **13** | [`src/app/(dashboard)/study/[setId]/match/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/match/page.tsx) | **557** | 🟡 Cao (P2) | Trò chơi ghép cặp: Lưới 12 thẻ (Term vs Def), xử lý click so khớp, stopwatch timer ms, combo streak, modal kỷ lục. | Tách hook `useMatchGame` + Sub-components Header, MatchGrid, MatchTile, GameOverModal. |
| **14** | [`src/app/(dashboard)/study/mistakes/mistakes-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/mistakes/mistakes-client.tsx) | **529** | 🟡 Cao (P2) | Sổ tay thẻ sai (Leech cards): Lọc theo set, tìm kiếm, tỷ lệ sai/lapses, đặt lại lapse, ôn tập nhanh các thẻ sai. | Tách hook `useMistakesNotebook` + Sub-components Header, Toolbar, CardsTable, QuickStudyDialog. |
| **15** | [`src/app/(dashboard)/study/[setId]/write/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/write/page.tsx) | **506** | 🟡 Cao (P2) | Luyện viết: Nghĩa tiếng Việt -> Gõ từ tiếng Nhật, so khớp chuỗi, xem đáp án, ôn lại các thẻ viết sai qua từng vòng. | Tách hook `useWriteSession` + Sub-components Header, PromptCard, InputForm, FeedbackView. |
| **16** | [`src/components/command-palette.tsx`](file:///p:/Nodejs/quizlet/apps/src/components/command-palette.tsx) | **450** | 🟢 Trung bình (P3) | Hộp thoại tìm kiếm toàn cục (Ctrl+K): Tìm sets, tìm thẻ, các lối tắt thao tác nhanh, chuyển hướng. | Tách hook `useCommandSearch` + Sub-components NavigationGroup, SetsGroup, ActionsGroup. |
| **17** | [`src/components/layout/sidebar.tsx`](file:///p:/Nodejs/quizlet/apps/src/components/layout/sidebar.tsx) | **443** | 🟢 Trung bình (P3) | Sidebar chính: Menu điều hướng, Cây thư mục (Folders Tree), Bộ thẻ gần đây, User footer. | Tách hook `useSidebarData` + Sub-components NavMenu, FolderTree, RecentSetsList, UserFooter. |
| **18** | [`src/app/page.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/page.tsx) | **391** | 🟢 Trung bình (P3) | Landing page: Hero section, Interactive demo flashcard, Features grid, SRS explanation, CTA banner. | Tách Sub-components HeroSection, DemoFlashcard, FeaturesSection, SrsSection, CtaSection. |
| **19** | [`src/app/(dashboard)/study/[setId]/study-mode-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/study/[setId]/study-mode-client.tsx) | **352** | 🟢 Trung bình (P3) | Hub chọn chế độ học: Grid 6 chế độ, tổng quan SRS phân loại thẻ, thông tin chi tiết bộ thẻ. | Tách Sub-components Header, ModeCardsGrid, SrsStatusSummary. |
| **20** | [`src/app/(dashboard)/tags/tags-client.tsx`](file:///p:/Nodejs/quizlet/apps/src/app/(dashboard)/tags/tags-client.tsx) | **271** | 🟢 Trung bình (P3) | Quản lý thẻ nhãn: Danh sách tags, số lượng thẻ, đổi màu, xoá tag, xem danh sách thẻ theo tag. | Tách hook `useTagsManagement` + Sub-components TagsGrid, TagCard, EditTagDialog. |

> **Lưu ý về thư viện UI primitives**: Các file trong `src/components/ui/*` (ví dụ `sidebar.tsx` 724 dòng, `chart.tsx` 373 dòng, `questionnaire.tsx` 328 dòng...) là mã nguồn chính thức được sinh bởi Shadcn CLI / Radix UI Primitives, được giữ nguyên để bảo đảm tính tương thích với hệ sinh thái Shadcn CLI (`pnpm dlx shadcn@latest`).

---

## 🏗️ II. Kiến Trúc Thư Mục Mục Tiêu (Target Folder Structure)

Toàn bộ logic trạng thái và sub-components sẽ được tổ chức theo từng miền nghiệp vụ (Feature-based structure):

```
apps/src/
├── hooks/
│   ├── study/
│   │   ├── use-flashcard-session.ts    # Logic phiên Flashcard (flip, auto-play, SRS rating)
│   │   ├── use-test-engine.ts          # State machine bài kiểm tra (phases, timer, scoring)
│   │   ├── use-learn-session.ts        # Adaptive learning queue & question generator
│   │   ├── use-match-game.ts           # Game ghép thẻ (pairing logic, stopwatch, combos)
│   │   ├── use-listen-session.ts       # Luyện nghe TTS, audio playback, answer matching
│   │   ├── use-write-session.ts        # Luyện viết, fuzzy compare, multiple rounds
│   │   └── use-mistakes-notebook.ts    # Leech cards filtering & reset actions
│   ├── import-export/
│   │   ├── use-anki-import.ts          # Anki deck preview & mapping
│   │   ├── use-csv-import.ts           # CSV/TSV preview & column mapping
│   │   ├── use-text-import.ts          # Delimited text parser & preview
│   │   ├── use-json-import.ts          # JSON sets importer
│   │   ├── use-export-sets.ts          # Multi-format exporter
│   │   └── use-backup-restore.ts       # Full system backup & restore
│   ├── sets/
│   │   ├── use-set-detail.ts           # Quản lý dữ liệu chi tiết bộ thẻ & search
│   │   └── use-set-card-operations.ts  # Bulk select, bulk tag, bulk delete, duplicate
│   ├── dashboard/
│   │   └── use-daily-goal.ts           # Quản lý mục tiêu học tập hàng ngày
│   ├── library/
│   │   └── use-library-sets.ts         # Quản lý danh sách sets, folders, filter, sort
│   ├── calendar/
│   │   └── use-calendar-srs.ts         # Tính toán ngày due & SRS schedule matrix
│   ├── stats/
│   │   └── use-stats-filter.ts         # Bộ lọc thời gian, năm heatmap & session history
│   └── settings/
│       ├── use-profile-settings.ts     # Cập nhật hồ sơ & avatar
│       ├── use-password-change.ts      # Đổi mật khẩu
│       └── use-learning-preferences.ts # Cài đặt SRS algorithm, mục tiêu & TTS
│
├── components/
│   ├── import-export/
│   │   ├── import-anki-tab.tsx
│   │   ├── import-csv-tab.tsx
│   │   ├── import-text-tab.tsx
│   │   ├── import-json-tab.tsx
│   │   ├── export-sets-tab.tsx
│   │   ├── backup-restore-tab.tsx
│   │   ├── target-folder-select.tsx
│   │   ├── restore-confirm-dialog.tsx
│   │   └── restore-summary-dialog.tsx
│   ├── study/
│   │   ├── flashcard/
│   │   │   ├── flashcard-header.tsx
│   │   │   ├── flashcard-viewer.tsx
│   │   │   └── flashcard-action-bar.tsx
│   │   ├── test/
│   │   │   ├── test-config-view.tsx
│   │   │   ├── test-runner-view.tsx
│   │   │   ├── test-question-card.tsx
│   │   │   ├── test-mcq-options.tsx
│   │   │   ├── test-tf-options.tsx
│   │   │   ├── test-written-input.tsx
│   │   │   ├── test-nav-palette.tsx
│   │   │   ├── test-result-view.tsx
│   │   │   ├── test-review-list.tsx
│   │   │   └── test-dialogs.tsx
│   │   ├── learn/
│   │   │   ├── learn-header.tsx
│   │   │   ├── learn-question-card.tsx
│   │   │   ├── learn-mcq-options.tsx
│   │   │   ├── learn-tf-options.tsx
│   │   │   ├── learn-written-input.tsx
│   │   │   └── learn-feedback-view.tsx
│   │   ├── match/
│   │   │   ├── match-header.tsx
│   │   │   ├── match-grid.tsx
│   │   │   ├── match-tile.tsx
│   │   │   └── match-game-over-modal.tsx
│   │   ├── listen/
│   │   │   ├── listen-header.tsx
│   │   │   ├── listen-audio-player.tsx
│   │   │   ├── listen-input-form.tsx
│   │   │   └── listen-feedback-view.tsx
│   │   ├── write/
│   │   │   ├── write-header.tsx
│   │   │   ├── write-prompt-card.tsx
│   │   │   ├── write-input-form.tsx
│   │   │   └── write-feedback-view.tsx
│   │   └── mistakes/
│   │       ├── mistakes-header.tsx
│   │       ├── mistakes-toolbar.tsx
│   │       ├── mistakes-cards-table.tsx
│   │       └── mistakes-quick-study-dialog.tsx
│   ├── stats/
│   │   ├── stats-kpi-card.tsx
│   │   ├── stats-overview-tab.tsx
│   │   ├── stats-analytics-tab.tsx
│   │   ├── stats-heatmap-tab.tsx
│   │   ├── stats-sessions-tab.tsx
│   │   └── stats-export-menu.tsx
│   ├── settings/
│   │   ├── settings-profile-tab.tsx
│   │   ├── settings-appearance-tab.tsx
│   │   ├── settings-learning-tab.tsx
│   │   ├── settings-shortcuts-tab.tsx
│   │   └── settings-danger-tab.tsx
│   ├── sets/
│   │   ├── set-detail-header.tsx
│   │   ├── set-study-modes-bar.tsx
│   │   ├── set-progress-banner.tsx
│   │   ├── set-cards-toolbar.tsx
│   │   ├── set-cards-table.tsx
│   │   ├── set-card-row.tsx
│   │   ├── set-bulk-tag-dialog.tsx
│   │   └── set-delete-dialogs.tsx
│   ├── dashboard/
│   │   ├── dashboard-welcome-banner.tsx
│   │   ├── dashboard-kpi-grid.tsx
│   │   ├── dashboard-goal-card.tsx
│   │   ├── dashboard-goal-dialog.tsx
│   │   ├── dashboard-activity-chart.tsx
│   │   ├── dashboard-recent-sets.tsx
│   │   └── dashboard-recent-sessions.tsx
│   ├── library/
│   │   ├── library-toolbar.tsx
│   │   ├── library-grid-view.tsx
│   │   ├── library-list-view.tsx
│   │   ├── library-set-card.tsx
│   │   ├── library-set-row.tsx
│   │   └── library-delete-dialog.tsx
│   ├── calendar/
│   │   ├── calendar-header.tsx
│   │   ├── calendar-grid.tsx
│   │   ├── calendar-day-cell.tsx
│   │   └── calendar-day-detail-sheet.tsx
│   ├── landing/
│   │   ├── landing-hero.tsx
│   │   ├── landing-demo-card.tsx
│   │   ├── landing-features-grid.tsx
│   │   ├── landing-srs-section.tsx
│   │   └── landing-cta.tsx
│   └── modals/
│       └── card-form/
│           ├── card-form-basic-tab.tsx
│           ├── card-form-kanji-tab.tsx
│           └── card-form-media-tab.tsx
```

---

## 🎯 III. Kế Hoạch Triển Khai Chi Tiết Từng Giai Đoạn (Phased Roadmap)

---

### 🔹 GIAI ĐOẠN 1: Tái Cấu Trúc Các "Siêu Component" Cốt Lõi (> 1,000 dòng)

#### Nhiệm vụ 1.1: Refactor Trang Import & Export (`src/app/(dashboard)/import-export/page.tsx` — 1,880 dòng ➔ 112 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Vấn đề**: File chứa 5 tab độc lập nhưng gộp chung tất cả state vào 1 function component, khiến mỗi lần gõ input hoặc upload file thì toàn bộ trang phải re-render.
- **Giải pháp**:
  1. Tạo thư mục `src/hooks/import-export/`:
     - `use-anki-import.ts`: State file, deck list, preview action, field mapping, import submit.
     - `use-csv-import.ts`: State raw content, delimiter, header, table preview, column mapping, import submit.
     - `use-text-import.ts`: Live parsing phân tách ký tự, preview thẻ sinh ra, import submit.
     - `use-json-import.ts`: Đọc JSON file FileReader, validate cấu trúc, preview sets count, import submit.
     - `use-export-sets.ts`: Fetch user sets, chọn nhiều set, export JSON/CSV/Anki/Zip.
     - `use-backup-restore.ts`: Download backup full database, restore dropzone, open dialogs.
  2. Tạo thư mục `src/components/import-export/`:
     - `target-folder-select.tsx`: Dropdown chọn folder đích dùng chung cho 4 tab import.
     - `import-anki-tab.tsx`, `import-csv-tab.tsx`, `import-text-tab.tsx`, `import-json-tab.tsx`, `export-sets-tab.tsx`, `backup-restore-tab.tsx`.
     - `restore-confirm-dialog.tsx`: Dialog cảnh báo ghi đè dữ liệu.
     - `restore-summary-dialog.tsx`: Bảng kết quả tổng số cards/sets/tags đã khôi phục.
  3. Tinh gọn `page.tsx`: Chỉ đóng vai trò điều hướng các Tab (`Tabs`, `TabsList`, `TabsContent`), giảm từ **1,880 dòng xuống dưới 120 dòng**.

#### Nhiệm vụ 1.2: Refactor Chế Độ Kiểm Tra (`src/app/(dashboard)/study/[setId]/test/page.tsx` — 1,255 dòng ➔ 128 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Vấn đề**: State machine bài thi (cấu hình -> làm bài -> kết quả) cùng toàn bộ logic sinh câu hỏi, timer đếm ngược, render 3 loại câu hỏi bị nhồi nhét vào 1 file.
- **Giải pháp**:
  1. Tạo hook `src/hooks/study/use-test-engine.ts`:
     - Quản lý trạng thái: `phase: 'config' | 'testing' | 'result'`.
     - Quản lý câu hỏi, active index, user answers map, time left, timer interval ref.
     - Logic tính điểm, so sánh đáp án chuẩn / fuzzy, lưu điểm cao nhất (Personal Best) vào localStorage.
     - Handlers: `startTest`, `selectAnswer`, `submitTest`, `restartTest`.
  2. Tạo thư mục `src/components/study/test/`:
     - `test-config-view.tsx`: Form tùy chọn số câu, loại câu hỏi (MCQ, TF, Written), thời gian làm bài.
     - `test-runner-view.tsx`: Khung làm bài (Tiêu đề, timer badge, question switcher, nút Nộp bài).
     - `test-question-card.tsx`: Wrapper hiển thị prompt từ vựng / Furigana / phát âm.
     - `test-mcq-options.tsx`, `test-tf-options.tsx`, `test-written-input.tsx`: Giao diện 3 dạng câu hỏi.
     - `test-nav-palette.tsx`: Lưới số câu hỏi để nhảy nhanh câu.
     - `test-result-view.tsx`: Tổng kết điểm, tỷ lệ đúng, thời gian làm bài, kỷ lục cá nhân.
     - `test-review-list.tsx`: Bảng xem lại từng câu hỏi kèm giải thích đúng/sai.
     - `test-dialogs.tsx`: Dialog xác nhận nộp bài và Dialog cảnh báo thoát bài thi.
  3. Tinh gọn `test/page.tsx`: Giảm từ **1,255 dòng xuống dưới 90 dòng**.

---

### 🔹 GIAI ĐOẠN 2: Tái Cấu Trúc Màn Hình Thống Kê & Cài Đặt (800 - 1,000 dòng)

#### Nhiệm vụ 2.1: Refactor Màn Hình Thống Kê (`src/app/(dashboard)/stats/stats-client.tsx` — 966 dòng ➔ 116 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Vấn đề**: 4 tab báo cáo cùng các biểu đồ Recharts nặng và ma trận Heatmap 52 tuần nằm chung, gây độ trễ khi chuyển tab hoặc thay đổi bộ lọc.
- **Giải pháp**:
  1. Tạo hook `src/hooks/stats/use-stats-filter.ts`:
     - Quản lý `timeRange` (7/30/90 ngày), `heatmapYear`, `sessionPage`, `selectedModeFilter`.
     - Điều phối `useTransition` khi gọi các server actions: `getDailyStatsAction`, `getHeatmapDataAction`, `getSessionsHistoryAction`.
  2. Tạo thư mục `src/components/stats/`:
     - `stats-kpi-card.tsx`: Thẻ KPI chuẩn hóa (icon, value, title, subtext xu hướng).
     - `stats-overview-tab.tsx`: Grid 4 KPIs + Pie chart phân bố SRS + Bar chart Top bộ thẻ.
     - `stats-analytics-tab.tsx`: Time range filter buttons + Area chart thời gian học + Bar chart độ chính xác.
     - `stats-heatmap-tab.tsx`: Calendar heatmap 52 tuần, chọn năm, cell tooltip hiển thị chi tiết số phút học.
     - `stats-sessions-tab.tsx`: Table lịch sử các phiên học với filter mode & pagination.
     - `stats-export-menu.tsx`: Menu xuất báo cáo thống kê CSV/JSON.
  3. Tinh gọn `stats-client.tsx`: Giảm từ **966 dòng xuống dưới 100 dòng**.

#### Nhiệm vụ 2.2: Refactor Trang Cài Đặt Hệ Thống (`src/app/(dashboard)/settings/page.tsx` — 926 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Vấn đề**: Quản lý nhiều form độc lập (hồ sơ, mật khẩu, font, SRS, mục tiêu ngày, âm thanh, danger zone) trong một component duy nhất.
- **Giải pháp**:
  1. Tạo thư mục `src/hooks/settings/`:
     - `use-profile-settings.ts`: Quản lý state tên, avatar, patch `/api/auth/me`.
     - `use-password-change.ts`: Quản lý mật khẩu cũ/mới, xác nhận mật khẩu, validation.
     - `use-learning-preferences.ts`: Quản lý SRS algorithm, daily goals, auto-play, TTS rate & voice preview.
  2. Tạo thư mục `src/components/settings/`:
     - `settings-profile-tab.tsx`: Card cập nhật thông tin + Card đổi mật khẩu.
     - `settings-appearance-tab.tsx`: Chọn theme (Dark/Light/System), cỡ chữ và phông chữ tiếng Nhật (Noto Sans, Zen Kaku, Kosugi Maru).
     - `settings-learning-tab.tsx`: Cấu hình thuật toán SRS (Auto/Simple/Advanced), mục tiêu ngày, giọng đọc & tốc độ TTS.
     - `settings-shortcuts-tab.tsx`: Toggle phím tắt và bảng cheatsheet phím tắt toàn hệ thống.
     - `settings-data-tab.tsx`: Tải file Full Backup JSON và điều hướng sang trang Nhập/Xuất.
  3. Tinh gọn `settings/page.tsx`: Giảm từ **926 dòng xuống còn 142 dòng**.

---

### 🔹 GIAI ĐOẠN 3: Tái Cấu Trúc Quản Lý Bộ Thẻ & Dashboard (700 - 850 dòng)

#### Nhiệm vụ 3.1: Refactor Màn Hình Chi Tiết Bộ Thẻ (`src/app/(dashboard)/sets/[id]/set-detail-client.tsx` — 849 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Vấn đề**: Chứa bảng danh sách thẻ, cơ chế chọn nhiều thẻ (selection state), các thao tác hàng loạt (bulk delete, bulk tag), phát âm, và 4 dialogs.
- **Giải pháp**:
  1. Tạo hook `src/hooks/sets/use-set-card-operations.ts`:
     - Quản lý selection: `selectedCardIds`, `toggleSelectAll`, `toggleSelectCard`, `clearSelection`.
     - Quản lý tìm kiếm: `searchCard`, `filteredCards`.
     - Quản lý operations: `confirmDeleteCard`, `handleDuplicateCard`, `confirmBulkDelete`, `handleBulkTag`, phát âm TTS tiếng Nhật.
  2. Tạo thư mục `src/components/sets/`:
     - `set-detail-header.tsx`: Breadcrumb, tên set, folder link, mô tả, nút sửa set, thêm thẻ, bắt đầu học, và 4 thẻ thống kê tiến độ.
     - `set-study-modes-bar.tsx`: Grid 6 nút vào nhanh các chế độ học với micro-animations.
     - `set-cards-toolbar.tsx`: Thanh tìm kiếm thẻ, counter, thanh công cụ bulk actions khi có thẻ được chọn.
     - `set-card-row.tsx`: Row thẻ memoized tối ưu hiệu năng re-render với TTS, JLPT level, ví dụ câu mẫu, nhãn và SRS status badge.
     - `set-cards-table.tsx`: Bảng danh sách thẻ với Select All checkbox.
     - `set-bulk-tag-dialog.tsx`: Modal chọn nhãn để gắn hàng loạt.
     - `set-delete-dialogs.tsx`: Modal xác nhận xoá 1 thẻ và xoá nhiều thẻ.
  3. Tinh gọn `set-detail-client.tsx`: Giảm từ **849 dòng xuống còn 136 dòng**.

#### Nhiệm vụ 3.2: Refactor Màn Hình Trang Chủ Dashboard (`src/app/(dashboard)/dashboard/dashboard-client.tsx` — 730 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Vấn đề**: Banner chào mừng, Streak flame, 4 KPI cards, Dialog sửa mục tiêu, Quick SRS review, Biểu đồ hoạt động 7 ngày, Danh sách bộ thẻ gần đây, Lịch sử buổi học gần nhất nằm chung trong một client component.
- **Giải pháp**:
  1. Tạo hook `src/hooks/dashboard/use-daily-goal.ts`:
     - Quản lý state mở dialog, input cardTarget, input timeTarget, transition gọi `updateGoalAction`.
  2. Tạo thư mục `src/components/dashboard/`:
     - `dashboard-welcome-banner.tsx`: Lời chào theo buổi trong ngày, streak flame badge, nút ôn tập nhanh thẻ đến hạn (Due reviews).
     - `dashboard-kpi-grid.tsx`: Grid 4 cards KPI chỉ số trong ngày (thẻ đã học, độ chính xác, thời gian học, thẻ cần ôn SRS).
     - `dashboard-goal-banner.tsx` & `dashboard-goal-dialog.tsx`: Hiển thị tiến độ hoàn thành mục tiêu ngày và dialog chỉnh sửa.
     - `dashboard-performance-charts.tsx`: Biểu đồ hoạt động 7 ngày (Recharts AreaChart) và hiệu suất theo chế độ học (BarChart).
     - `dashboard-recent-sets.tsx`: Grid danh sách các bộ thẻ vừa học / vừa tạo.
     - `dashboard-recent-sessions.tsx`: Danh sách lịch sử các phiên học gần nhất.
  3. Tinh gọn `dashboard-client.tsx`: Giảm từ **730 dòng xuống còn 88 dòng**.

---

### 🔹 GIAI ĐOẠN 4: Tái Cấu Trúc Toàn Bộ Các Chế Độ Học Tập (Study Modes — 500 - 770 dòng)

#### Nhiệm vụ 4.1: Refactor Chế Độ Flashcard (`src/app/(dashboard)/study/[setId]/flashcard/page.tsx` — 766 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Giải pháp**:
  - Tách hook `src/hooks/study/use-flashcard-session.ts`: Quản lý session lifecycle, currentIndex, isFlipped, isReverse, isShuffle, isAutoPlay, timer autoplay loop, fullscreen, answer submit action, TTS và keyboard shortcuts.
  - Tách Sub-components `src/components/study/flashcard/`:
    - `flashcard-header.tsx`: Thanh điều hướng, tiến độ học, toggles (Shuffle, Auto-play, Fullscreen, Phím tắt).
    - `flashcard-viewer.tsx`: 3D card xoay lật mượt mà, render Term/Reading/Audio/Nghĩa/Kanji/Hình ảnh.
    - `flashcard-action-bar.tsx`: Bộ nút điều hướng trước/sau/lật thẻ, nút đánh giá SRS (Chưa biết / Đã biết) với hotkey hints.
  - Tinh gọn `flashcard/page.tsx`: Giảm từ **766 dòng xuống còn 140 dòng**.

#### Nhiệm vụ 4.2: Refactor Chế Độ Học Thích Ứng (`src/app/(dashboard)/study/[setId]/learn/page.tsx` — 699 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Giải pháp**:
  - Tách hook `src/hooks/study/use-learn-session.ts`: Quản lý hàng đợi thẻ (queue), sinh câu hỏi thích ứng (MCQ/TF/Written), xử lý feedback đúng/sai, đưa thẻ sai về cuối hàng đợi để học lại, cập nhật SRS data qua Server Actions.
  - Tách Sub-components `src/components/study/learn/`:
    - `learn-header.tsx`: Thanh điều hướng, tiến độ học thuộc thẻ.
    - `learn-question-card.tsx`: Khung câu hỏi, prompt câu hỏi, âm thanh phát âm TTS.
    - `learn-mcq-options.tsx`, `learn-tf-options.tsx`, `learn-written-input.tsx`: Giao diện trả lời cho từng dạng câu hỏi (Trắc nghiệm 4 lựa chọn, Đúng/Sai, Tự gõ từ vựng tiếng Nhật).
    - `learn-feedback-view.tsx`: Banner thông báo đúng/sai, hiển thị đáp án mẫu kèm câu ví dụ và nút Tiếp tục.
  - Tinh gọn `learn/page.tsx`: Giảm từ **699 dòng xuống còn 145 dòng**.

#### Nhiệm vụ 4.3: Refactor Chế Độ Luyện Nghe (`src/app/(dashboard)/study/[setId]/listen/page.tsx` — 583 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Giải pháp**:
  - Tách types `src/types/listen.ts`: Kiểu dữ liệu thẻ luyện nghe `ListenCardItem` và trạng thái `ListenStatus`.
  - Tách hook `src/hooks/study/use-listen-session.ts`: Tự động đọc TTS khi nạp thẻ mới, tốc độ phát âm (0.5x - 1.2x), phím tắt Space để phát lại, gợi ý luỹ tiến theo số lần gõ sai (chữ đầu -> Furigana & nghĩa tiếng Việt), so khớp câu trả lời nghe được với `isStudyAnswerCorrect`, ghi nhận Server Actions (`startStudySessionAction`, `answerCardAction`, `endStudySessionAction`).
  - Tách Sub-components `src/components/study/listen/`:
    - `listen-header.tsx`: Thanh điều hướng thoát, bộ đếm số câu và thanh tiến độ hoàn thành.
    - `listen-audio-player.tsx`: Trình phát âm thanh lớn (Waveform animation 5 cột nhảy theo điệu phát, nút Loa gradient tròn nổi bật, thanh chọn tốc độ phát âm 0.5x - 1.2x, JLPT level badge).
    - `listen-answer-form.tsx`: Ô nhập từ vựng tiếng Nhật nghe được, gợi ý thông minh khi gõ sai, nút Bỏ qua và Kiểm tra (Enter).
    - `listen-result-card.tsx`: Hiển thị kết quả đúng/sai, đáp án chính xác kèm Furigana, nghĩa tiếng Việt, câu ví dụ mẫu và nút Tiếp tục.
  - Tinh gọn `listen/page.tsx`: Giảm từ **583 dòng xuống còn 128 dòng**.

#### Nhiệm vụ 4.4: Refactor Chế Độ Ghép Thẻ (`src/app/(dashboard)/study/[setId]/match/page.tsx` — 557 dòng) [ĐÃ HOÀN THÀNH ✅]
- **Giải pháp**:
  - Tách types `src/types/match.ts`: Định nghĩa kiểu dữ liệu `MatchCardItem` và `MatchTile`.
  - Tách hook `src/hooks/study/use-match-game.ts`: Sinh 6 cặp (12 tiles), xáo trộn lưới thẻ, state selectedTileId, logic so khớp tile (phát âm từ vựng khi chọn/ghép đúng), stopwatch timer theo ms (+1s penalty khi chọn sai kèm hiệu ứng rung lắc), lưu và so sánh kỷ lục cá nhân (PB) vào `localStorage`, gửi Server Actions `startStudySessionAction` và `endStudySessionAction`.
  - Tách Sub-components `src/components/study/match/`:
    - `match-header.tsx`: Thanh điều hướng về bộ thẻ, tên bộ thẻ, đồng hồ bấm giờ thực tế (ms -> 0.1s), đếm số cặp còn lại và nút chơi lại ván mới.
    - `match-tile.tsx`: Nút thẻ bài linh hoạt với animations chuyển đổi trạng thái (chọn, ghép đúng biến mất, ghép sai rung nảy, badge ngôn ngữ/định nghĩa).
    - `match-grid.tsx`: Lưới hiển thị các thẻ bài responsive 2-4 cột.
    - `match-result-card.tsx`: Khung chiến thắng với cúp Trophy, thông báo Kỷ lục mới (PB), đồng hồ thời gian lớn, thống kê số cặp/lỗi phạt/PB và nút chơi lại ván mới.
  - Tinh gọn `match/page.tsx`: Giảm từ **557 dòng xuống còn 85 dòng**.

#### Nhiệm vụ 4.5: Refactor Chế Độ Luyện Viết (`src/app/(dashboard)/study/[setId]/write/page.tsx` — 506 dòng)
- **Giải pháp**:
  - Tách hook `src/hooks/study/use-write-session.ts`: Quản lý prompt nghĩa, kiểm tra chuỗi câu trả lời, xem đáp án khi quên, vòng lặp gõ lại các thẻ sai cho đến khi thuộc toàn bộ.
  - Tách Sub-components `src/components/study/write/`:
    - `write-header.tsx`: Tiến độ vòng học và số thẻ đã ghi nhớ.
    - `write-prompt-card.tsx`: Hiển thị nghĩa tiếng Việt và gợi ý từ loại.
    - `write-input-form.tsx`: Ô nhập tiếng Nhật kèm phím gửi bài.
    - `write-feedback-view.tsx`: Bảng so sánh từ người dùng gõ vs từ đúng khi trả lời sai.
  - Tinh gọn `write/page.tsx`: Giảm từ **506 dòng xuống dưới 70 dòng**.

#### Nhiệm vụ 4.6: Refactor Sổ Tay Thẻ Sai (`src/app/(dashboard)/study/mistakes/mistakes-client.tsx` — 529 dòng)
- **Giải pháp**:
  - Tách hook `src/hooks/study/use-mistakes-notebook.ts`: Filter theo set, tìm kiếm thẻ, sort theo lapses/tỷ lệ sai, reset lapse action.
  - Tách Sub-components `src/components/study/mistakes/`:
    - `mistakes-header.tsx`, `mistakes-toolbar.tsx`, `mistakes-cards-table.tsx`, `mistakes-quick-study-dialog.tsx`.
  - Tinh gọn `mistakes-client.tsx`: Giảm từ **529 dòng xuống dưới 90 dòng**.

---

### 🔹 GIAI ĐOẠN 5: Tái Cấu Trúc Thư Viện, Lịch, Form Modal & Layout (200 - 670 dòng)

#### Nhiệm vụ 5.1: Refactor Modal Tạo & Sửa Thẻ (`src/components/modals/create-card-modal.tsx` — 670 dòng)
- **Giải pháp**:
  - Tách hook `src/hooks/sets/use-card-form.ts`: Quản lý react-hook-form + zod resolver, fetch available tags, preview/upload ảnh thẻ học, submit create/update.
  - Tách Sub-components `src/components/modals/card-form/`:
    - `card-form-basic-tab.tsx`: Các trường cơ bản (Term, Reading, Definition, Example, Translation, Note).
    - `card-form-kanji-tab.tsx`: Các trường nâng cao (JLPT level, Word type, Radicals, Stroke count, On/Kun reading, Compounds).
    - `card-form-media-tab.tsx`: Upload & xem trước hình ảnh, Multi-select tags với khả năng tạo tag mới ngay trong modal.
  - Tinh gọn `create-card-modal.tsx`: Giảm từ **670 dòng xuống dưới 100 dòng**.

#### Nhiệm vụ 5.2: Refactor Trang Thư Viện (`src/app/(dashboard)/library/page.tsx` — 603 dòng)
- **Giải pháp**:
  - Tách hook `src/hooks/library/use-library-sets.ts`: Fetch sets, folders, search, filter theo folder, sort, trigger delete/duplicate actions.
  - Tách Sub-components `src/components/library/`:
    - `library-toolbar.tsx`: Thanh tìm kiếm, filter folder, sort select, chuyển đổi Grid/List, nút Tạo set / Ghép sets.
    - `library-grid-view.tsx` & `library-set-card.tsx`: Hiển thị dạng lưới thẻ.
    - `library-list-view.tsx` & `library-set-row.tsx`: Hiển thị dạng bảng chi tiết.
    - `library-delete-dialog.tsx`: Dialog xác nhận xoá bộ thẻ an toàn.
  - Tinh gọn `library/page.tsx`: Giảm từ **603 dòng xuống dưới 90 dòng**.

#### Nhiệm vụ 5.3: Refactor Trang Lịch Ôn Tập (`src/app/(dashboard)/calendar/calendar-client.tsx` — 595 dòng)
- **Giải pháp**:
  - Tách hook `src/hooks/calendar/use-calendar-srs.ts`: Tính toán ma trận ngày trong tháng, phân bổ thẻ due vào từng ngày, quản lý ngày được chọn (selectedDate).
  - Tách Sub-components `src/components/calendar/`:
    - `calendar-header.tsx`: Điều hướng tháng, nút Hôm nay, tổng thẻ cần ôn trong tháng.
    - `calendar-grid.tsx` & `calendar-day-cell.tsx`: Lưới 7 cột hiển thị các ngày kèm badge số thẻ và màu nhiệt.
    - `calendar-day-detail-sheet.tsx`: Sheet mở ra danh sách thẻ cần ôn trong ngày được click kèm nút bắt đầu học.
  - Tinh gọn `calendar-client.tsx`: Giảm từ **595 dòng xuống dưới 90 dòng**.

#### Nhiệm vụ 5.4: Refactor Hộp Thoại Lệnh & Sidebar Layout
- **`src/components/command-palette.tsx` (450 dòng)**:
  - Tách hook `useCommandSearch.ts` lọc sets & actions.
  - Tách các nhóm lệnh: `command-nav-group.tsx`, `command-sets-group.tsx`, `command-actions-group.tsx`.
- **`src/components/layout/sidebar.tsx` (443 dòng)**:
  - Tách hook `useSidebarNavigation.ts` quản lý trạng thái collapse & folders tree.
  - Tách Sub-components: `sidebar-nav-menu.tsx`, `sidebar-folder-tree.tsx`, `sidebar-recent-sets.tsx`, `sidebar-user-footer.tsx`.
- **`src/app/page.tsx` (391 dòng)**:
  - Tách các sections trang Landing Page: `landing-hero.tsx`, `landing-demo-card.tsx`, `landing-features-grid.tsx`, `landing-srs-section.tsx`, `landing-cta.tsx`.
- **`src/app/(dashboard)/study/[setId]/study-mode-client.tsx` (352 dòng)**:
  - Tách `study-mode-header.tsx`, `study-mode-cards-grid.tsx`, `study-mode-srs-summary.tsx`.

---

## 🛡️ IV. Nguyên Tắc An Toàn & Chuẩn Kỹ Thuật Khi Triển Khai (Quality Assurance)

Trong suốt quá trình thực hiện việc refactor, mọi tác vụ phải tuân thủ nghiêm ngặt các quy chuẩn sau:

1. **Bảo toàn 100% tính năng hiện tại (No Regression)**:
   - Giữ nguyên các Server Actions (`src/actions/*`), API Routes (`src/app/api/*`) và Schemas (`src/schemas/*`).
   - Đảm bảo các URLs, search parameters (ví dụ: `?reverse=true`, `?status=New`, `?tag=...`) tiếp tục hoạt động chính xác.
   - Không làm thay đổi giao diện hoặc mất các phím tắt bàn phím đã có.
2. **Type Safety & Zod Validation**:
   - Sử dụng kiểu dữ liệu TypeScript nghiêm ngặt (Strict mode), không dùng kiểu `any`.
   - Mọi form submit và dữ liệu gửi lên Server Action phải được kiểm tra qua Zod schema tương ứng.
3. **Hiệu Năng & Tối Ưu Render (Vercel React Best Practices)**:
   - Các row trong table hoặc item trong grid (`set-card-row.tsx`, `match-tile.tsx`) phải được memoize bằng `React.memo` khi cần thiết để tránh re-render hàng loạt khi gõ input.
   - Tách trạng thái (state lifting vs local state) hợp lý: Trạng thái chỉ dùng trong 1 modal/tab thì đặt tại component con, không đưa lên component cha nếu không chia sẻ dữ liệu.
4. **Quy Trình Kiểm Tra Bắt Buộc Sau Mỗi Component Được Refactor**:
   - Chạy format: `pnpm format`
   - Chạy kiểm tra tĩnh ESLint: `pnpm lint`
   - Chạy biên dịch Next.js: `pnpm build`
   - Xác nhận không có lỗi runtime trên dev/production build.

---

## 📅 V. Kế Hoạch Bàn Giao & Thứ Tự Thực Hiện

| Giai đoạn | Hạng mục | Dự kiến giảm số dòng | Tiêu chí hoàn thành (DoD) |
| :--- | :--- | :---: | :--- |
| **P0: Siêu Component** | • `import-export/page.tsx`<br>• `study/[setId]/test/page.tsx` | Từ 3,135 dòng ➔ < 250 dòng | Tách xong 7 hooks + 18 sub-components; Test import Anki/CSV/JSON & Test mode chạy mượt mà; `pnpm build` pass. |
| **P1: Báo Cáo & Cài Đặt** | • `stats-client.tsx`<br>• `settings/page.tsx` | Từ 1,892 dòng ➔ < 220 dòng | Tách xong 4 hooks + 11 sub-components; Biểu đồ Recharts và cập nhật cài đặt hoạt động chuẩn; `pnpm build` pass. |
| **P2: Bộ Thẻ & Dashboard** | • `set-detail-client.tsx`<br>• `dashboard-client.tsx` | Từ 1,579 dòng ➔ < 220 dòng | Tách xong 2 hooks + 13 sub-components; Bulk actions thẻ và mục tiêu ngày hoạt động chính xác; `pnpm build` pass. |
| **P3: Các Chế Độ Học** | • `flashcard/page.tsx`<br>• `learn/page.tsx`<br>• `listen/page.tsx`<br>• `match/page.tsx`<br>• `write/page.tsx`<br>• `mistakes-client.tsx` | Từ 3,640 dòng ➔ < 480 dòng | Tách xong 6 hooks + 20 sub-components; Toàn bộ 6 chế độ học và sổ tay thẻ sai hoạt động trơn tru; `pnpm build` pass. |
| **P4: Thư Viện, Lịch & Modals** | • `create-card-modal.tsx`<br>• `library/page.tsx`<br>• `calendar-client.tsx`<br>• `command-palette.tsx`<br>• `sidebar.tsx`<br>• `study-mode-client.tsx`<br>• `landing page.tsx` | Từ 3,450 dòng ➔ < 550 dòng | Tách xong 4 hooks + 22 sub-components; Modal tạo thẻ, Thư viện, Lịch, Command Palette và Sidebar chạy hoàn hảo; `pnpm build` & `pnpm lint` pass 100%. |

---

*Tài liệu này là cơ sở kỹ thuật chuẩn hóa để tiến hành việc refactor tuần tự và an toàn cho toàn bộ codebase NihoMemo.*
