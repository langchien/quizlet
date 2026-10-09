# 📘 Hướng Dẫn Kỹ Thuật Prisma 7 — Dự Án NihoMemo

> **Tài liệu bắt buộc dành cho tất cả AI Agents & Developers tham gia dự án**  
> Dự án NihoMemo sử dụng **Prisma ORM v7** (kiến trúc Rust-free, ESM-first, Driver Adapter) kết hợp cùng PostgreSQL 15.

---

## 1. Điểm Khác Biệt Cốt Lõi Giữa Prisma 7 và Các Bản Cũ (v5/v6)

| Đặc tính | Prisma v5/v6 | Prisma v7 (Dự án NihoMemo) |
| :--- | :--- | :--- |
| **Engine** | Rust binary query engine | **Rust-free (TypeScript / WASM native)** |
| **Driver Connection** | Direct connection mặc định | **Bắt buộc dùng Driver Adapter** (`@prisma/adapter-pg` + `pg.Pool`) |
| **Cấu hình DATABASE_URL** | Trong `schema.prisma` (`url = env(...)`) | **Tập trung tại `apps/prisma.config.ts`** |
| **Generator Provider** | `provider = "prisma-client-js"` | **`provider = "prisma-client"`** |
| **Vị trí Client sinh ra** | `node_modules/@prisma/client` | **Tùy biến qua `output` (trong `apps/src/generated/prisma`)** |
| **Import trong Code** | `from "@prisma/client"` | **`from "@/generated/prisma/client"` hoặc `from "@/lib/prisma"`** |

---

## 2. Cấu Trúc File & Cấu Hình

### 2.1. File cấu hình CLI: `apps/prisma.config.ts`
Prisma 7 chuyển toàn bộ cấu hình môi trường và đường dẫn ra file TypeScript chuẩn:
```typescript
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
```
> ⚠️ **Lưu ý cho Agents**: Không xóa file này. Mọi cấu hình kết nối database khi chạy migrate/generate được đọc từ đây.

### 2.2. File Schema: `apps/prisma/schema.prisma`
Khối `datasource` KHÔNG chứa `url`. Khối `generator` bắt buộc khai báo `output`:
```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// Định nghĩa models bên dưới...
```

### 2.3. Singleton Client: `apps/src/lib/prisma.ts`
Khởi tạo `PrismaClient` với Driver Adapter `@prisma/adapter-pg`:
```typescript
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
  globalForPrisma.pgPool = pool
}

export default prisma
```

---

## 3. Quy Tắc Code Dành Cho AI Agents

1. **Truy vấn Database trong API / Server Actions**:
   - Luôn import instance singleton từ `@/lib/prisma`:
     ```typescript
     import prisma from "@/lib/prisma"
     // Hoặc: import { prisma } from "@/lib/prisma"
     ```
2. **Import Types / Enums / Models**:
   - Khi cần type của model (ví dụ `User`, `StudySet`, `Card`):
     ```typescript
     import type { User, Prisma } from "@/generated/prisma/client"
     ```
3. **Thêm / Cập nhật Models mới**:
   - Thêm model vào `apps/prisma/schema.prisma`.
   - Chạy lệnh migration: `pnpm db:migrate` (tạo migration SQL mới trong `prisma/migrations`).
   - Chạy lệnh sinh client: `pnpm db:generate` (cập nhật type & client tại `src/generated/prisma`).
4. **Không chỉnh sửa trực tiếp thư mục `src/generated/prisma/`**:
   - Thư mục này được sinh tự động và đã được cấu hình bỏ qua trong `.gitignore` và `.prettierignore`.
5. **Chạy Build / Production**:
   - Script `pnpm build` đã được cấu hình tự động chạy `prisma generate && next build`.

---

## 4. Danh Sách Lệnh Thao Tác Cơ Sở Dữ Liệu

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `pnpm db:up` | Khởi động PostgreSQL Docker container (`docker compose up -d`) |
| `pnpm db:down` | Dừng PostgreSQL Docker container |
| `pnpm db:migrate` | Tạo và áp dụng migration mới (`prisma migrate dev`) |
| `pnpm db:generate` | Tạo Prisma Client TypeScript mới (`prisma generate`) |
| `pnpm db:studio` | Mở giao diện trực quan Prisma Studio |
| `pnpm db:seed` | Nạp dữ liệu mẫu ban đầu (`tsx prisma/seed.ts`) |
| `pnpm format` | Định dạng toàn bộ code (tự động bỏ qua code generated) |
