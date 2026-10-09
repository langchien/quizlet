import { z } from "zod"
import {
  JLPTLevelSchema,
  WordTypeSchema,
  CardStatusSchema,
  StudyModeSchema,
} from "./enums"

/**
 * Schema cho một thẻ khi import
 */
export const ImportCardItemSchema = z.object({
  term: z.string().min(1, "Từ vựng (Term) không được để trống"),
  reading: z.string().default(""),
  definition: z.string().min(1, "Nghĩa (Definition) không được để trống"),
  example: z.string().optional().nullable(),
  exampleTranslation: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  jlptLevel: JLPTLevelSchema.optional().nullable(),
  wordType: WordTypeSchema.optional().nullable(),
  radicals: z.string().optional().nullable(),
  strokeCount: z.number().int().optional().nullable(),
  onReading: z.string().optional().nullable(),
  kunReading: z.string().optional().nullable(),
  compounds: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
})

export type ImportCardItem = z.infer<typeof ImportCardItemSchema>

/**
 * Schema import dữ liệu định dạng JSON (1 bộ thẻ hoặc nhiều bộ thẻ)
 */
export const ImportJSONSchema = z.object({
  setName: z.string().min(1, "Tên bộ thẻ không được để trống"),
  description: z.string().optional().nullable(),
  sourceLanguage: z.string().default("ja"),
  targetLanguage: z.string().default("vi"),
  folderId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  cards: z.array(ImportCardItemSchema).min(1, "Bộ thẻ phải có ít nhất 1 thẻ"),
})

export type ImportJSONBody = z.infer<typeof ImportJSONSchema>

/**
 * Schema import nhiều bộ thẻ từ file JSON
 */
export const ImportBulkJSONSchema = z.object({
  sets: z.array(ImportJSONSchema).min(1, "Cần có ít nhất 1 bộ thẻ để import"),
})

export type ImportBulkJSONBody = z.infer<typeof ImportBulkJSONSchema>

/**
 * Cấu hình ánh xạ cột khi import CSV/TSV
 */
export const ColumnMappingSchema = z.object({
  termIndex: z.number().int().min(0),
  readingIndex: z.number().int().min(0).optional().nullable(),
  definitionIndex: z.number().int().min(0),
  exampleIndex: z.number().int().min(0).optional().nullable(),
  exampleTranslationIndex: z.number().int().min(0).optional().nullable(),
  noteIndex: z.number().int().min(0).optional().nullable(),
  jlptLevelIndex: z.number().int().min(0).optional().nullable(),
  wordTypeIndex: z.number().int().min(0).optional().nullable(),
  tagsIndex: z.number().int().min(0).optional().nullable(),
})

export type ColumnMapping = z.infer<typeof ColumnMappingSchema>

/**
 * Schema import dữ liệu định dạng CSV / TSV
 */
export const ImportCSVSchema = z.object({
  setName: z.string().min(1, "Tên bộ thẻ không được để trống"),
  description: z.string().optional().nullable(),
  folderId: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung CSV không được để trống"),
  delimiter: z.string().default(","),
  hasHeader: z.boolean().default(true),
  columnMapping: ColumnMappingSchema,
  tags: z.array(z.string()).optional().default([]),
})

export type ImportCSVBody = z.infer<typeof ImportCSVSchema>

/**
 * Schema import văn bản thô (Quizlet copy-paste)
 */
export const ImportTextSchema = z.object({
  setName: z.string().min(1, "Tên bộ thẻ không được để trống"),
  description: z.string().optional().nullable(),
  folderId: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung văn bản không được để trống"),
  termDefSeparator: z.string().default("\t"),
  cardSeparator: z.string().default("\n"),
  tags: z.array(z.string()).optional().default([]),
})

export type ImportTextBody = z.infer<typeof ImportTextSchema>

/**
 * Schema cấu hình ánh xạ trường của Anki Note Type sang NihoMemo Card
 */
export const AnkiFieldMappingSchema = z.object({
  term: z.string().optional().nullable(),
  reading: z.string().optional().nullable(),
  definition: z.string().optional().nullable(),
  example: z.string().optional().nullable(),
  exampleTranslation: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  jlptLevel: z.string().optional().nullable(),
  wordType: z.string().optional().nullable(),
})

export type AnkiFieldMapping = z.infer<typeof AnkiFieldMappingSchema>

/**
 * Schema kết quả Preview từ file Anki .apkg
 */
export const AnkiPreviewDeckSchema = z.object({
  id: z.number().or(z.string()),
  name: z.string(),
  cardCount: z.number(),
  modelName: z.string(),
  fields: z.array(z.string()),
  suggestedMapping: AnkiFieldMappingSchema,
  sampleCards: z.array(
    z.object({
      term: z.string(),
      reading: z.string(),
      definition: z.string(),
      example: z.string().optional().nullable(),
      exampleTranslation: z.string().optional().nullable(),
      rawFields: z.record(z.string(), z.string()),
    })
  ),
})

export type AnkiPreviewDeck = z.infer<typeof AnkiPreviewDeckSchema>

/**
 * Schema xuất dữ liệu bộ thẻ
 */
export const ExportSetSchema = z.object({
  setId: z.string().min(1),
  format: z.enum(["json", "csv"]).default("json"),
  includeMedia: z.boolean().default(false),
})

export type ExportSetQuery = z.infer<typeof ExportSetSchema>

/**
 * Schema bản sao lưu toàn bộ (Full Backup)
 */
export const BackupDataSchema = z.object({
  version: z.string().default("1.0.0"),
  exportedAt: z.string(),
  app: z.literal("NihoMemo"),
  user: z
    .object({
      settings: z.any().optional(),
    })
    .optional(),
  folders: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      parentId: z.string().optional().nullable(),
      order: z.number().default(0),
    })
  ),
  studySets: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      sourceLanguage: z.string().default("ja"),
      targetLanguage: z.string().default("vi"),
      folderId: z.string().optional().nullable(),
      cardCount: z.number().default(0),
      createdAt: z.string().or(z.date()).optional(),
      updatedAt: z.string().or(z.date()).optional(),
      cards: z.array(
        z.object({
          id: z.string(),
          term: z.string(),
          reading: z.string(),
          definition: z.string(),
          example: z.string().optional().nullable(),
          exampleTranslation: z.string().optional().nullable(),
          imageUrl: z.string().optional().nullable(),
          audioUrl: z.string().optional().nullable(),
          note: z.string().optional().nullable(),
          jlptLevel: JLPTLevelSchema.optional().nullable(),
          wordType: WordTypeSchema.optional().nullable(),
          radicals: z.string().optional().nullable(),
          strokeCount: z.number().optional().nullable(),
          onReading: z.string().optional().nullable(),
          kunReading: z.string().optional().nullable(),
          compounds: z.string().optional().nullable(),
          order: z.number().default(0),
          tags: z.array(z.string()).optional(),
          srsData: z
            .object({
              status: CardStatusSchema.default("New"),
              easeFactor: z.number().default(2.5),
              interval: z.number().default(0),
              repetitions: z.number().default(0),
              nextReviewDate: z.string().or(z.date()).optional(),
              lastReviewDate: z.string().or(z.date()).optional().nullable(),
              correctCount: z.number().default(0),
              incorrectCount: z.number().default(0),
            })
            .optional()
            .nullable(),
        })
      ),
    })
  ),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().default("#3B82F6"),
    })
  ),
  studySessions: z
    .array(
      z.object({
        studySetId: z.string().optional().nullable(),
        mode: StudyModeSchema,
        startedAt: z.string().or(z.date()),
        endedAt: z.string().or(z.date()).optional().nullable(),
        duration: z.number().default(0),
        totalCards: z.number().default(0),
        correctCards: z.number().default(0),
        incorrectCards: z.number().default(0),
        score: z.number().default(0),
      })
    )
    .optional(),
  dailyStats: z
    .array(
      z.object({
        date: z.string(),
        cardsStudied: z.number().default(0),
        cardsCorrect: z.number().default(0),
        cardsIncorrect: z.number().default(0),
        timeSpent: z.number().default(0),
        newCardsSeen: z.number().default(0),
        reviewCards: z.number().default(0),
        streak: z.number().default(0),
      })
    )
    .optional(),
  userGoal: z
    .object({
      dailyCardTarget: z.number().default(20),
      dailyTimeTarget: z.number().default(15),
      currentStreak: z.number().default(0),
      longestStreak: z.number().default(0),
      lastStudyDate: z.string().or(z.date()).optional().nullable(),
    })
    .optional()
    .nullable(),
})

export type BackupData = z.infer<typeof BackupDataSchema>
