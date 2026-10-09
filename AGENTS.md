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

1. **Kiến trúc Rust-free & ESM**:
   - Sử dụng `prisma@7.x` và `@prisma/client@7.x`.
   - Cấu hình CLI tập trung tại `apps/prisma.config.ts`.
2. **Schema (`apps/prisma/schema.prisma`)**:
   - `generator client`: `provider = "prisma-client"`, `output = "../src/generated/prisma"`.
   - `datasource db`: `provider = "postgresql"` (KHÔNG chứa `url`).
3. **Database Driver Adapter**:
   - Bắt buộc dùng `@prisma/adapter-pg` và `pg.Pool`.
   - Sử dụng singleton từ `@/lib/prisma`.
4. **Import Types & Models**:
   - `import type { User, Prisma } from "@/generated/prisma/client"`
5. **Code Generated**:
   - Thư mục `src/generated/prisma` được sinh tự động, không sửa tay và đã được cấu hình trong `.gitignore` và `.prettierignore`.

---

## 🛠️ 3. Quy Chuẩn Chung
1. **Giao tiếp**: Lên kế hoạch, báo cáo và comment code bằng tiếng Việt.
2. **TypeScript**: Strict mode, typing rõ ràng, Zod validation cho dữ liệu vào/ra.
3. **UI / Styling**: Shadcn UI + Tailwind CSS v4, luôn hỗ trợ cả Dark Mode và Light Mode.
4. **Kiểm tra**: Luôn chạy `pnpm build` và kiểm tra endpoint `/api/health` trước khi bàn giao hoàn thành task.
