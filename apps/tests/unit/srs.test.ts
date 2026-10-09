import { describe, it, expect } from "vitest"
import {
  calculateAutoSRS,
  calculateSimpleSRS,
  calculateSM2,
  type CurrentSRSState,
} from "@/lib/srs/algorithms"

describe("Kiểm thử SRS Engine (Spaced Repetition Algorithms)", () => {
  const defaultInitialState: CurrentSRSState = {
    status: "New",
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    correctCount: 0,
    incorrectCount: 0,
  }

  describe("1. Thuật toán Automatic Mode (Tự thích ứng theo thời gian)", () => {
    it("Xử lý khi trả lời sai: đặt lại interval = 1, giảm easeFactor, chuyển về Learning", () => {
      const state: CurrentSRSState = {
        status: "Review",
        easeFactor: 2.5,
        interval: 10,
        repetitions: 3,
        correctCount: 5,
        incorrectCount: 0,
      }

      const res = calculateAutoSRS(state, false, 4)
      expect(res.status).toBe("Learning")
      expect(res.repetitions).toBe(0)
      expect(res.interval).toBe(1)
      expect(res.easeFactor).toBe(2.3)
      expect(res.incorrectCount).toBe(1)
      expect(res.correctCount).toBe(5)
    })

    it("Xử lý khi trả lời đúng nhanh (< 5s): tính Easy, tăng easeFactor và giãn khoảng cách", () => {
      // Lần 1: repetition = 0 -> interval = 3
      const res1 = calculateAutoSRS(defaultInitialState, true, 3)
      expect(res1.repetitions).toBe(1)
      expect(res1.interval).toBe(3)
      expect(res1.easeFactor).toBe(2.65)
      expect(res1.status).toBe("Review")

      // Lần 2: repetition = 1 -> interval = 7
      const res2 = calculateAutoSRS(
        {
          ...defaultInitialState,
          repetitions: 1,
          interval: 3,
          easeFactor: 2.65,
        },
        true,
        2
      )
      expect(res2.repetitions).toBe(2)
      expect(res2.interval).toBe(7)
      expect(res2.easeFactor).toBe(2.8)

      // Lần tiếp theo với interval cao -> chuyển sang Mastered
      const highState: CurrentSRSState = {
        status: "Review",
        easeFactor: 2.8,
        interval: 18,
        repetitions: 4,
        correctCount: 6,
        incorrectCount: 0,
      }
      const resMastered = calculateAutoSRS(highState, true, 3)
      expect(resMastered.repetitions).toBe(5)
      expect(resMastered.interval).toBeGreaterThanOrEqual(21)
      expect(resMastered.status).toBe("Mastered")
    })

    it("Xử lý khi trả lời đúng vừa phải (5-15s): Good", () => {
      const res = calculateAutoSRS(defaultInitialState, true, 8)
      expect(res.repetitions).toBe(1)
      expect(res.interval).toBe(1)
      expect(res.easeFactor).toBe(2.55)
      expect(res.status).toBe("Learning")
    })

    it("Xử lý khi trả lời đúng nhưng chậm (> 15s): Hard", () => {
      const res = calculateAutoSRS(defaultInitialState, true, 20)
      expect(res.repetitions).toBe(1)
      expect(res.interval).toBe(1)
      expect(res.easeFactor).toBe(2.35)
      expect(res.status).toBe("Learning")
    })
  })

  describe("2. Thuật toán Simple Mode (Kiểu Quizlet: Again / Hard / Good / Easy)", () => {
    it("Đánh giá 'again': lùi về Learning, interval = 0, repetitions = 0", () => {
      const state: CurrentSRSState = {
        status: "Review",
        easeFactor: 2.5,
        interval: 5,
        repetitions: 2,
        correctCount: 4,
        incorrectCount: 1,
      }
      const res = calculateSimpleSRS(state, "again")
      expect(res.status).toBe("Learning")
      expect(res.interval).toBe(0)
      expect(res.repetitions).toBe(0)
      expect(res.incorrectCount).toBe(2)
    })

    it("Đánh giá 'hard': interval = 1 ngày, giảm nhẹ easeFactor", () => {
      const res = calculateSimpleSRS(defaultInitialState, "hard")
      expect(res.status).toBe("Learning")
      expect(res.interval).toBe(1)
      expect(res.repetitions).toBe(1)
      expect(res.easeFactor).toBe(2.4)
    })

    it("Đánh giá 'good': interval = 3 ngày lần đầu, nhân đôi các lần sau", () => {
      const res1 = calculateSimpleSRS(defaultInitialState, "good")
      expect(res1.status).toBe("Review")
      expect(res1.interval).toBe(3)
      expect(res1.repetitions).toBe(1)

      const res2 = calculateSimpleSRS(
        { ...defaultInitialState, repetitions: 1, interval: 3 },
        "good"
      )
      expect(res2.interval).toBe(6)
      expect(res2.status).toBe("Review")
    })

    it("Đánh giá 'easy': interval = 7 ngày lần đầu, chuyển Mastered nếu interval >= 21", () => {
      const res1 = calculateSimpleSRS(defaultInitialState, "easy")
      expect(res1.status).toBe("Review")
      expect(res1.interval).toBe(7)
      expect(res1.easeFactor).toBe(2.65)

      const highState: CurrentSRSState = {
        status: "Review",
        easeFactor: 2.65,
        interval: 10,
        repetitions: 2,
        correctCount: 3,
        incorrectCount: 0,
      }
      const res2 = calculateSimpleSRS(highState, "easy")
      expect(res2.interval).toBe(25) // 10 * 2.5 = 25
      expect(res2.status).toBe("Mastered")
    })
  })

  describe("3. Thuật toán SuperMemo-2 (SM-2 Advanced Mode)", () => {
    it("Đánh giá chuẩn xác chất lượng q=5 (Hoàn hảo): interval nhảy 1 -> 6 -> 6*EF", () => {
      const res1 = calculateSM2(defaultInitialState, 5)
      expect(res1.repetitions).toBe(1)
      expect(res1.interval).toBe(1)
      expect(res1.easeFactor).toBe(2.6) // 2.5 + (0.1 - 0) = 2.6

      const res2 = calculateSM2(
        {
          ...defaultInitialState,
          repetitions: 1,
          interval: 1,
          easeFactor: 2.6,
        },
        5
      )
      expect(res2.repetitions).toBe(2)
      expect(res2.interval).toBe(6)

      const res3 = calculateSM2(
        {
          ...defaultInitialState,
          repetitions: 2,
          interval: 6,
          easeFactor: 2.7,
        },
        5
      )
      expect(res3.repetitions).toBe(3)
      expect(res3.interval).toBe(Math.round(6 * 2.8))
    })

    it("Đánh giá kém q < 3: lặp lại từ đầu repetitions = 0, interval = 1", () => {
      const state: CurrentSRSState = {
        status: "Review",
        easeFactor: 2.5,
        interval: 10,
        repetitions: 3,
        correctCount: 6,
        incorrectCount: 0,
      }
      const res = calculateSM2(state, 2)
      expect(res.repetitions).toBe(0)
      expect(res.interval).toBe(1)
      expect(res.status).toBe("Learning")
      expect(res.easeFactor).toBeLessThan(2.5)
      expect(res.incorrectCount).toBe(1)
    })

    it("Ease Factor không bao giờ giảm xuống dưới ngưỡng tối thiểu 1.3", () => {
      const state: CurrentSRSState = {
        ...defaultInitialState,
        easeFactor: 1.35,
      }
      const res = calculateSM2(state, 0)
      expect(res.easeFactor).toBe(1.3)
    })
  })
})
