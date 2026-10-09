import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"
import { CalendarDueResponseSchema } from "@/schemas/calendar"
import {
  StartSessionSchema,
  AnswerQuestionSchema,
  EndSessionSchema,
} from "@/schemas/session"
import {
  DailyStatsResponseSchema,
  HeatmapItemSchema,
  DashboardStatsResponseSchema,
} from "@/schemas/stats"
import {
  ImportJSONSchema,
  ImportTextSchema,
  ImportCSVSchema,
} from "@/schemas/import-export"
import { JLPT_LEVELS, WORD_TYPES, CARD_STATUSES, STUDY_MODES } from "@/types"

describe("Kiểm thử mở rộng: Utils & Các Schemas bổ sung", () => {
  it("Kiểm thử hàm cn() ghép lớp CSS động với tailwind-merge và clsx", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white")
    // Ghi đè class xung đột
    expect(cn("p-4", "p-2")).toBe("p-2")
    // Bỏ qua giá trị falsy / undefined
    expect(cn("font-bold", false && "hidden", null, undefined, "italic")).toBe(
      "font-bold italic"
    )
  })

  it("CalendarDueResponseSchema xác thực phản hồi lịch ôn tập hợp lệ", () => {
    const valid = {
      year: 2026,
      month: 10,
      days: {
        "2026-10-09": {
          date: "2026-10-09",
          dueCount: 5,
          newCount: 2,
          learningCount: 1,
          reviewCount: 2,
        },
      },
      totalDueThisMonth: 15,
      totalDueToday: 5,
      overdueCount: 1,
    }
    const parsed = CalendarDueResponseSchema.safeParse(valid)
    expect(parsed.success).toBe(true)
  })

  it("Session schemas xác thực StartSession, AnswerQuestion và EndSession", () => {
    const start = {
      studySetId: "set_test_123",
      mode: "Flashcard",
      shuffle: true,
      reverse: false,
    }
    expect(StartSessionSchema.safeParse(start).success).toBe(true)

    const answer = {
      sessionId: "session_123",
      cardId: "card_123",
      isCorrect: true,
      timeTaken: 4,
    }
    expect(AnswerQuestionSchema.safeParse(answer).success).toBe(true)

    const end = {
      sessionId: "session_123",
      mode: "Flashcard",
      totalCards: 20,
      correctCards: 18,
      incorrectCards: 2,
      duration: 350,
      score: 90,
    }
    expect(EndSessionSchema.safeParse(end).success).toBe(true)
  })

  it("Stats schemas xác thực phản hồi thống kê và heatmap", () => {
    const daily = {
      id: "stats_123",
      userId: "user_123",
      date: "2026-10-09",
      cardsStudied: 25,
      cardsCorrect: 23,
      cardsIncorrect: 2,
      timeSpent: 600,
      newCardsSeen: 5,
      reviewCards: 20,
      streak: 30,
    }
    expect(DailyStatsResponseSchema.safeParse(daily).success).toBe(true)

    const heatmap = {
      date: "2026-10-09",
      count: 25,
      level: 3,
    }
    expect(HeatmapItemSchema.safeParse(heatmap).success).toBe(true)

    const dashboard = {
      cardsStudiedToday: 25,
      cardsCorrectToday: 23,
      cardsIncorrectToday: 2,
      timeSpentTodaySeconds: 600,
      accuracyToday: 92,
      currentStreak: 30,
      longestStreak: 30,
      dailyGoal: {
        cardTarget: 25,
        timeTargetMinutes: 20,
        cardProgress: 100,
        timeProgressMinutes: 50,
        isCardTargetMet: true,
        isTimeTargetMet: false,
      },
      dueCardsCount: 5,
      totalSetsCount: 5,
      totalCardsCount: 43,
      masteredCardsCount: 10,
    }
    expect(DashboardStatsResponseSchema.safeParse(dashboard).success).toBe(true)
  })

  it("Import schemas xác thực ImportJSONSchema, ImportTextSchema và ImportCSVSchema", () => {
    const jsonImport = {
      setName: "Từ vựng N5",
      cards: [
        { term: "猫", reading: "ねこ", definition: "Con mèo" },
        { term: "犬", reading: "いぬ", definition: "Con chó" },
      ],
    }
    expect(ImportJSONSchema.safeParse(jsonImport).success).toBe(true)

    const textImport = {
      setName: "Import từ Text",
      content: "私 - Tôi\n本 - Sách",
      termDefSeparator: " - ",
      cardSeparator: "\n",
    }
    expect(ImportTextSchema.safeParse(textImport).success).toBe(true)

    const csvImport = {
      setName: "Import từ CSV",
      content: "term,reading,definition\n私,わたし,Tôi",
      delimiter: ",",
      hasHeader: true,
      columnMapping: {
        termIndex: 0,
        readingIndex: 1,
        definitionIndex: 2,
      },
    }
    expect(ImportCSVSchema.safeParse(csvImport).success).toBe(true)
  })

  it("Kiểm tra toàn vẹn danh sách các Constants / Enums dự án", () => {
    expect(JLPT_LEVELS).toContain("N5")
    expect(JLPT_LEVELS).toContain("N1")
    expect(WORD_TYPES).toContain("Noun")
    expect(WORD_TYPES).toContain("Verb")
    expect(CARD_STATUSES).toContain("Mastered")
    expect(STUDY_MODES).toContain("Flashcard")
    expect(STUDY_MODES).toContain("Listen")
  })
})
