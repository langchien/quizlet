<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🤖 Quy Định Kỹ Thuật Dành Cho AI Agents — Dự Án NihoMemo

Tất cả AI Agents khi phát triển tính năng, sửa lỗi hoặc refactor trong repository này **BẮT BUỘC** phải tra cứu và tuân thủ các **Agent Skills** đã cài đặt trong thư mục [`.agents/skills/`](file:///p:/Nodejs/quizlet/.agents/skills) cùng các tài liệu kỹ thuật sau đây trước khi viết bất kỳ dòng code nào.

---

## 📌 1. Bắt Buộc Tra Cứu Agent Skills Trước Khi Triển Khai (`.agents/skills/`)

Trước khi thực hiện bất kỳ nhiệm vụ nào, AI Agent **PHẢI** đọc các skill liên quan trong `.agents/skills/` để áp dụng đúng design patterns:

| Hạng mục phát triển | Skills BẮT BUỘC tra cứu trong `.agents/skills/` | Mục tiêu áp dụng |
| :--- | :--- | :--- |
| **Next.js 16 & React 19** | • [`vercel-react-best-practices`](file:///p:/Nodejs/quizlet/.agents/skills/vercel-react-best-practices/SKILL.md)<br>• [`vercel-composition-patterns`](file:///p:/Nodejs/quizlet/.agents/skills/vercel-composition-patterns/SKILL.md)<br>• [`vercel-optimize`](file:///p:/Nodejs/quizlet/.agents/skills/vercel-optimize/SKILL.md)<br>• [`vercel-react-view-transitions`](file:///p:/Nodejs/quizlet/.agents/skills/vercel-react-view-transitions/SKILL.md) | Tối ưu Server/Client Components, tránh re-render thừa, áp dụng compound component pattern, optimize Core Web Vitals, View Transitions mượt mà. |
| **Tailwind CSS v4** | • [`tailwind-4-docs`](file:///p:/Nodejs/quizlet/.agents/skills/tailwind-4-docs/SKILL.md) | Tuân thủ cú pháp Tailwind v4 (`@theme`, `@import "tailwindcss"`, CSS variables, tokens). Không dùng cấu hình Tailwind v3 cũ. |
| **Shadcn UI & Design** | • [`shadcn`](file:///p:/Nodejs/quizlet/.agents/skills/shadcn/SKILL.md)<br>• [`web-design-guidelines`](file:///p:/Nodejs/quizlet/.agents/skills/web-design-guidelines/SKILL.md) | Dùng CLI `pnpm dlx shadcn@latest add`, tuân thủ semantic colors (`bg-primary`, `text-muted-foreground`), chuẩn Accessibility (A11y), Dark/Light mode. |
| **State & Data Fetching** | • [`tanstack-query`](file:///p:/Nodejs/quizlet/.agents/skills/tanstack-query/SKILL.md)<br>• [`tanstack-table`](file:///p:/Nodejs/quizlet/.agents/skills/tanstack-table/SKILL.md) | Chuẩn hóa React Query v5 hooks (`useQuery`, `useMutation`), invalidate queries khi học SRS / CRUD thẻ, xử lý Table data-grid cho danh sách thẻ / sets. |
| **Prisma ORM v7 & Database** | • [`prisma-client-api`](file:///p:/Nodejs/quizlet/.agents/skills/prisma-client-api/SKILL.md)<br>• [`prisma-driver-adapter-implementation`](file:///p:/Nodejs/quizlet/.agents/skills/prisma-driver-adapter-implementation/SKILL.md)<br>• [`prisma-upgrade-v7`](file:///p:/Nodejs/quizlet/.agents/skills/prisma-upgrade-v7/SKILL.md)<br>• [`prisma-cli`](file:///p:/Nodejs/quizlet/.agents/skills/prisma-cli/SKILL.md)<br>• [`prisma-orm-setup`](file:///p:/Nodejs/quizlet/.agents/skills/prisma-orm-setup/SKILL.md) | Tuân thủ kiến trúc Prisma 7, `@prisma/adapter-pg` với `pg.Pool`, query an toàn type-safe, transaction khi học SRS/test, quản lý migration chuẩn. |

---

## 📌 2. Tài Liệu Dự Án Tham Chiếu

- [Tài liệu chức năng tổng quan](file:///p:/Nodejs/quizlet/func.md): Phân tích toàn bộ nghiệp vụ, màn hình, luồng học Flashcard & SRS.
- [Kế hoạch và danh sách nhiệm vụ](file:///p:/Nodejs/quizlet/tasks.md): Chi tiết từng Phase và Task cần thực hiện.
- [Tiến độ phát triển](file:///p:/Nodejs/quizlet/progress.md): Trạng thái hoàn thành của từng task.
- [Hướng dẫn kỹ thuật Prisma 7](file:///p:/Nodejs/quizlet/docs/PRISMA_7_GUIDE.md): **BẮT BUỘC ĐỌC** khi thao tác với cơ sở dữ liệu, schema, migrations hoặc models.

---

## ⚡ 3. Quy Chuẩn Cơ Sở Dữ Liệu: Prisma ORM v7

Dự án sử dụng **Prisma ORM v7** với các quy chuẩn kỹ thuật bắt buộc:

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

## 🎨 4. Quy Chuẩn Giao Diện & Shadcn UI (Tuân thủ Shadcn Skill)

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

## 🛠️ 5. Quy Chuẩn Chung

1. **Giao tiếp**: Lên kế hoạch, báo cáo và comment code bằng **tiếng Việt**.
2. **TypeScript**: Strict mode, typing rõ ràng, Zod validation cho toàn bộ dữ liệu vào/ra (Request/Response).
3. **Kiểm tra**: Luôn chạy `pnpm build`, `pnpm lint` và kiểm tra endpoint `/api/health` trước khi bàn giao hoàn thành task.

