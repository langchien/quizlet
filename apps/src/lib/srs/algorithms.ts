import type { CardStatus } from "@/generated/prisma/client"

export type SRSRating = "again" | "hard" | "good" | "easy" | number

export interface CurrentSRSState {
  status: CardStatus
  easeFactor: number
  interval: number
  repetitions: number
  correctCount: number
  incorrectCount: number
}

export interface SRSCalculationResult {
  status: CardStatus
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
  correctCount: number
  incorrectCount: number
}

/**
 * 1. Automatic Mode (Mặc định - Tự thích ứng theo kết quả và thời gian trả lời)
 */
export function calculateAutoSRS(
  current: CurrentSRSState,
  isCorrect: boolean,
  timeTakenSeconds: number = 0
): SRSCalculationResult {
  const correctCount = current.correctCount + (isCorrect ? 1 : 0)
  const incorrectCount = current.incorrectCount + (isCorrect ? 0 : 1)
  let easeFactor = current.easeFactor || 2.5
  let interval = current.interval || 0
  let repetitions = current.repetitions || 0
  let status: CardStatus = current.status || "New"

  if (!isCorrect) {
    // Trả lời sai -> Đưa về học lại
    repetitions = 0
    interval = 1
    easeFactor = Math.max(1.3, easeFactor - 0.2)
    status = "Learning"
  } else {
    // Trả lời đúng -> Đánh giá độ dễ dựa trên thời gian
    if (timeTakenSeconds > 0 && timeTakenSeconds < 5) {
      // Nhanh (< 5s): Easy
      easeFactor = Math.min(3.0, easeFactor + 0.15)
      if (repetitions === 0) {
        interval = 3
      } else if (repetitions === 1) {
        interval = 7
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor * 1.3))
      }
    } else if (timeTakenSeconds >= 5 && timeTakenSeconds <= 15) {
      // Vừa phải (5-15s): Good
      easeFactor = Math.min(3.0, easeFactor + 0.05)
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 4
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor))
      }
    } else {
      // Chậm (> 15s): Hard
      easeFactor = Math.max(1.3, easeFactor - 0.15)
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 2
      } else {
        interval = Math.max(1, Math.round(interval * 1.2))
      }
    }

    repetitions += 1

    // Chuyển đổi trạng thái
    if (repetitions >= 5 && interval >= 21) {
      status = "Mastered"
    } else if (repetitions >= 2 || interval >= 3) {
      status = "Review"
    } else {
      status = "Learning"
    }
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    status,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReviewDate,
    correctCount,
    incorrectCount,
  }
}

/**
 * 2. Simple Mode (Kiểu Quizlet: Repeat / Hard / Okay / Easy)
 */
export function calculateSimpleSRS(
  current: CurrentSRSState,
  rating: "again" | "hard" | "good" | "easy"
): SRSCalculationResult {
  const isCorrect = rating !== "again"
  const correctCount = current.correctCount + (isCorrect ? 1 : 0)
  const incorrectCount = current.incorrectCount + (isCorrect ? 0 : 1)
  let repetitions = current.repetitions || 0
  let interval = current.interval || 0
  let status: CardStatus = current.status || "New"
  let easeFactor = current.easeFactor || 2.5

  switch (rating) {
    case "again":
      repetitions = 0
      interval = 0
      status = "Learning"
      easeFactor = Math.max(1.3, easeFactor - 0.2)
      break
    case "hard":
      repetitions += 1
      interval = 1
      status = "Learning"
      easeFactor = Math.max(1.3, easeFactor - 0.1)
      break
    case "good":
      repetitions += 1
      interval = repetitions === 1 ? 3 : Math.max(3, Math.round(interval * 2))
      status = interval >= 21 ? "Mastered" : "Review"
      break
    case "easy":
      repetitions += 1
      interval = repetitions === 1 ? 7 : Math.max(7, Math.round(interval * 2.5))
      status = interval >= 21 ? "Mastered" : "Review"
      easeFactor = Math.min(3.0, easeFactor + 0.15)
      break
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    status,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReviewDate,
    correctCount,
    incorrectCount,
  }
}

/**
 * 3. Advanced Mode (Thuật toán SuperMemo-2 SM-2 chuẩn xác)
 * Quality: 0 - 5
 */
export function calculateSM2(
  current: CurrentSRSState,
  quality: number
): SRSCalculationResult {
  const q = Math.max(0, Math.min(5, quality))
  const isCorrect = q >= 3
  const correctCount = current.correctCount + (isCorrect ? 1 : 0)
  const incorrectCount = current.incorrectCount + (isCorrect ? 0 : 1)

  let easeFactor = current.easeFactor || 2.5
  let interval = current.interval || 0
  let repetitions = current.repetitions || 0
  let status: CardStatus = current.status || "New"

  // Công thức cập nhật Ease Factor của SM-2
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  if (q >= 3) {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor))
    }
    repetitions += 1

    if (repetitions >= 5 && interval >= 21) {
      status = "Mastered"
    } else if (interval >= 3) {
      status = "Review"
    } else {
      status = "Learning"
    }
  } else {
    repetitions = 0
    interval = 1
    status = "Learning"
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    status,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReviewDate,
    correctCount,
    incorrectCount,
  }
}
