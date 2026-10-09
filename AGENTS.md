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

## 🛠️ 3. Quy Chuẩn Chung

1. **Giao tiếp**: Lên kế hoạch, báo cáo và comment code bằng **tiếng Việt**.
2. **TypeScript**: Strict mode, typing rõ ràng, Zod validation cho toàn bộ dữ liệu vào/ra (Request/Response).
3. **UI / Styling**: Shadcn UI + Tailwind CSS v4, luôn hỗ trợ cả Dark Mode và Light Mode.
4. **Kiểm tra**: Luôn chạy `pnpm build`, `pnpm lint` và kiểm tra endpoint `/api/health` trước khi bàn giao hoàn thành task.
