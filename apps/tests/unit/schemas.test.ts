import { describe, it, expect } from "vitest"
import { LoginBodySchema, RegisterBodySchema } from "@/schemas/auth"
import { CreateCardSchema, UpdateCardSchema } from "@/schemas/card"
import { CreateSetSchema, UpdateSetSchema } from "@/schemas/set"
import { CreateFolderSchema, UpdateFolderSchema } from "@/schemas/folder"
import { CreateTagSchema } from "@/schemas/tag"
import { ReviewCardSchema } from "@/schemas/srs"
import { UpdateGoalSchema } from "@/schemas/goals"

describe("Kiểm thử Schemas & DTO Validation (Zod Schemas)", () => {
  describe("1. Auth Schemas", () => {
    it("Xác thực LoginBodySchema thành công với email & mật khẩu hợp lệ", () => {
      const valid = { email: "user@example.com", password: "password123" }
      const parsed = LoginBodySchema.safeParse(valid)
      expect(parsed.success).toBe(true)
    })

    it("Báo lỗi khi Login email sai định dạng hoặc mật khẩu quá ngắn", () => {
      const invalid = { email: "not-an-email", password: "123" }
      const parsed = LoginBodySchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })

    it("RegisterBodySchema kiểm tra tên, email, password và xác nhận password", () => {
      const valid = {
        name: "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        password: "securePassword123",
        confirmPassword: "securePassword123",
      }
      const parsed = RegisterBodySchema.safeParse(valid)
      expect(parsed.success).toBe(true)

      const mismatch = { ...valid, confirmPassword: "differentPassword" }
      const parsedMismatch = RegisterBodySchema.safeParse(mismatch)
      expect(parsedMismatch.success).toBe(false)
    })
  })

  describe("2. Card Schemas", () => {
    it("Xác thực CreateCardSchema với các trường từ vựng và Kanji", () => {
      const card = {
        studySetId: "set_cuid_12345",
        term: "勉強",
        reading: "べんきょう",
        definition: "Học tập, nghiên cứu",
        example: "日本語を勉強します。",
        exampleTranslation: "Tôi học tiếng Nhật.",
        jlptLevel: "N5",
        wordType: "Noun",
        tagIds: ["tag_1", "tag_2"],
      }
      const res = CreateCardSchema.safeParse(card)
      expect(res.success).toBe(true)
    })

    it("Từ chối khi thiếu trường bắt buộc term hoặc definition hoặc studySetId", () => {
      const invalid = { term: "", definition: "" }
      const res = CreateCardSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it("UpdateCardSchema cho phép cập nhật từng phần không cần studySetId", () => {
      const partialUpdate = {
        definition: "Định nghĩa mới",
        example: "Câu ví dụ mới",
      }
      const res = UpdateCardSchema.safeParse(partialUpdate)
      expect(res.success).toBe(true)
    })
  })

  describe("3. StudySet & Folder Schemas", () => {
    it("CreateSetSchema hợp lệ với tên và ngôn ngữ mặc định", () => {
      const set = {
        name: "Minna no Nihongo Bài 5",
        description: "Đi lại, phương tiện giao thông",
        sourceLanguage: "ja",
        targetLanguage: "vi",
      }
      const res = CreateSetSchema.safeParse(set)
      expect(res.success).toBe(true)
    })

    it("UpdateSetSchema cho phép cập nhật tên bộ thẻ", () => {
      const update = { name: "Tên bộ thẻ đã sửa" }
      const res = UpdateSetSchema.safeParse(update)
      expect(res.success).toBe(true)
    })

    it("CreateFolderSchema hợp lệ với parentId tuỳ chọn", () => {
      const folder = {
        name: "Từ vựng N3",
        description: "Các bộ thẻ cấp độ N3",
        parentId: "folder_parent_123",
      }
      const res = CreateFolderSchema.safeParse(folder)
      expect(res.success).toBe(true)
    })

    it("UpdateFolderSchema cho phép sửa tên và đổi thứ tự thư mục", () => {
      const update = { name: "Thư mục mới", order: 2 }
      const res = UpdateFolderSchema.safeParse(update)
      expect(res.success).toBe(true)
    })
  })

  describe("4. Tag, SRS & Goals Schemas", () => {
    it("CreateTagSchema kiểm tra tên nhãn và mã màu HEX", () => {
      const validTag = { name: "Kanji N4", color: "#EF4444" }
      expect(CreateTagSchema.safeParse(validTag).success).toBe(true)
    })

    it("ReviewCardSchema xác thực đánh giá SRS", () => {
      const validReview = {
        cardId: "card_cuid_123",
        rating: "good",
        timeTaken: 8,
      }
      expect(ReviewCardSchema.safeParse(validReview).success).toBe(true)
    })

    it("UpdateGoalSchema xác thực mục tiêu số thẻ và thời gian học", () => {
      const validGoal = { dailyCardTarget: 30, dailyTimeTarget: 25 }
      expect(UpdateGoalSchema.safeParse(validGoal).success).toBe(true)

      const invalidGoal = { dailyCardTarget: -5 }
      expect(UpdateGoalSchema.safeParse(invalidGoal).success).toBe(false)
    })
  })
})
