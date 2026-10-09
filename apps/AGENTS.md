<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 🚨 BẮT BUỘC ĐỌC: QUY ĐỊNH SỬ DỤNG PRISMA 7

Dự án này sử dụng **Prisma ORM v7** với các quy chuẩn kỹ thuật mới:

1. **Tài liệu chuẩn**: Chi tiết hướng dẫn xem tại `docs/PRISMA_7_GUIDE.md`. Mọi agent thao tác với database hoặc prisma phải tuân thủ nghiêm ngặt tài liệu này.
2. **Cấu hình**: File cấu hình CLI là `prisma.config.ts` (quản lý `datasource.url = env("DATABASE_URL")`). Không thêm thuộc tính `url` vào `schema.prisma`.
3. **Generator Client**:
   - `provider = "prisma-client"` (không dùng `prisma-client-js`).
   - `output = "../src/generated/prisma"`.
4. **Driver Adapter**: Bắt buộc dùng `@prisma/adapter-pg` cùng `pg.Pool` khi khởi tạo `PrismaClient`. Luôn dùng singleton tại `src/lib/prisma.ts`.
5. **Importing**:
   - Truy vấn database: `import prisma from "@/lib/prisma"`.
   - Lấy types/models/enums: `import type { User, Prisma } from "@/generated/prisma/client"`.
6. **Không can thiệp thủ công** vào thư mục `src/generated/` (đã được ignore bởi Prettier và Git).
