<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Quy Định Kỹ Thuật Dành Cho AI Agents — Dự Án NihoMemo

Tất cả AI Agents khi phát triển tính năng, sửa lỗi hoặc refactor trong repository này **BẮT BUỘC** phải đọc và tuân thủ các tài liệu kỹ thuật sau:

---

## 📌 1. Tài Liệu Dự Án Tham Chiếu

- [Tài liệu chức năng tổng quan](file:///p:/Nodejs/quizlet/func.md): Phân tích toàn bộ nghiệp vụ, màn hình, luồng học Flashcard & SRS.
- [Kế hoạch và danh sách nhiệm vụ](file:///p:/Nodejs/quizlet/tasks.md): Chi tiết từng Phase và Task cần thực hiện.
- [Tiến độ phát triển](file:///p:/Nodejs/quizlet/progress.md): Trạng thái hoàn thành của từng task.
- [Hướng dẫn kỹ thuật Prisma 7](file:///p:/Nodejs/quizlet/docs/PRISMA_7_GUIDE.md): **BẮT BUỘC ĐỌC** khi thao tác với cơ sở dữ liệu, schema, migrations hoặc models.
- [Quy chuẩn Shadcn UI Skill](file:///p:/Nodejs/quizlet/.agents/skills/shadcn/SKILL.md): **BẮT BUỘC TUÂN THỦ** khi xây dựng UI, thêm component hoặc styling giao diện (`.agents/skills/shadcn/`).

---

## ⚡ 2. Quy Chuẩn Cơ Sở Dữ Liệu: Prisma ORM v7

Dự án sử dụng **Prisma ORM v7** với các quy chuẩn kỹ thuật mới:

1. **Kiến trúc Rust-free & ESM**:
   - Sử dụng `prisma@7.x` và `@prisma/client@7.x`.
   - Cấu hình CLI tập trung tại `apps/prisma.config.ts` (quản lý `datasource.url = env("DATABASE_URL")`). Không thêm thuộc tính `url` vào `schema.prisma`.
2. **Schema (`apps/prisma/schema.prisma`)**:
   - `generator client`: `provider = "prisma-client"` (không dùng `prisma-client-js`), `output = "../src/generated/prisma"`.
   - `datasource db`: `provider = "postgresql"` (KHÔNG chứa `url`).
3. **Database Driver Adapter**:
   - Bắt buộc dùng `@prisma/adapter-pg` và `pg.Pool` khi khởi tạo `PrismaClient`.
   - Luôn sử dụng singleton từ `@/lib/prisma` (`import prisma from "@/lib/prisma"`).
4. **Import Types & Models**:
   - `import type { User, Prisma, StudySet, Card, SRSData, Tag } from "@/generated/prisma/client"`
5. **Code Generated**:
   - Thư mục `src/generated/prisma` được sinh tự động bởi `prisma generate`, không can thiệp thủ công (đã cấu hình trong `.gitignore` và `.prettierignore`).

---

## 🎨 3. Quy Chuẩn Giao Diện & Shadcn UI (Tuân thủ Shadcn Skill)

Toàn bộ quá trình phát triển UI phải tuân thủ nghiêm ngặt **Shadcn UI Skill** tại `.agents/skills/shadcn/SKILL.md`:

1. **Sử dụng CLI & Component có sẵn**:
   - Dùng `pnpm dlx shadcn@latest add <component>` hoặc `pnpm dlx shadcn@latest search` trước khi tự viết custom UI.
   - Tra cứu tài liệu và ví dụ: `pnpm dlx shadcn@latest docs <component>`.
2. **Composition & Cấu trúc Component**:
   - Bố cục: dùng `flex` kết hợp `gap-*` (không dùng `space-y-*` hay `space-x-*`).
   - Kích thước bằng nhau: dùng `size-*` thay vì `w-* h-*`.
   - Rút gọn text: dùng `truncate`.
   - Ghép class động: luôn dùng hàm `cn()`.
   - Dialog, Sheet, Drawer luôn bắt buộc có `Title` (dùng `className="sr-only"` nếu ẩn).
   - Card: Sử dụng đầy đủ `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
   - Empty states: Ưu tiên dùng `Empty` component.
   - Loading: Sử dụng `Skeleton` component thay vì custom animate-pulse.
3. **Màu sắc ngữ nghĩa (Semantic Tokens)**:
   - Luôn dùng semantic tokens: `bg-primary`, `text-muted-foreground`, `bg-background`, `border-border`, `bg-card`, v.v. Không hardcode mã màu hoặc raw classes (như `bg-blue-500`, trừ trường hợp badge phân loại cố định).
   - Luôn hỗ trợ hoàn hảo cả **Dark Mode** và **Light Mode** thông qua theme CSS variables.

---

## 🛠️ 4. Quy Chuẩn Chung

1. **Giao tiếp**: Lên kế hoạch, báo cáo và comment code bằng **tiếng Việt**.
2. **TypeScript**: Strict mode, typing rõ ràng, Zod validation cho toàn bộ dữ liệu vào/ra (Request/Response).
3. **Kiểm tra**: Luôn chạy `pnpm build`, `pnpm lint` và kiểm tra endpoint `/api/health` trước khi bàn giao hoàn thành task.

