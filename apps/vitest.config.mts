import { defineConfig } from "vitest/config"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://nihomemo:nihomemo_password123@localhost:54321/nihomemo?schema=public"
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "access_secret_for_vitest_testing_key_123456"
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "refresh_secret_for_vitest_testing_key_654321"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts", "src/schemas/**/*.ts"],
      exclude: ["src/generated/**", "src/lib/prisma.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
