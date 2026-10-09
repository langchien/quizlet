import { z } from "zod"

/**
 * Schema import dữ liệu định dạng JSON
 */
export const ImportJSONSchema = z.object({
  setName: z.string().min(1, "Tên bộ thẻ không được để trống"),
  description: z.string().optional(),
  folderId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  cards: z
    .array(
      z.object({
        term: z.string().min(1),
        reading: z.string().min(1),
        definition: z.string().min(1),
        example: z.string().optional().nullable(),
        exampleTranslation: z.string().optional().nullable(),
        note: z.string().optional().nullable(),
        jlptLevel: z.string().optional().nullable(),
        wordType: z.string().optional().nullable(),
        radicals: z.string().optional().nullable(),
        strokeCount: z.number().optional().nullable(),
        onReading: z.string().optional().nullable(),
        kunReading: z.string().optional().nullable(),
        compounds: z.string().optional().nullable(),
      })
    )
    .min(1, "Bộ thẻ phải có ít nhất 1 thẻ"),
})

export type ImportJSONBody = z.infer<typeof ImportJSONSchema>

/**
 * Schema import dữ liệu định dạng CSV / TSV / Văn bản
 */
export const ImportCSVSchema = z.object({
  setName: z.string().min(1, "Tên bộ thẻ không được để trống"),
  description: z.string().optional(),
  folderId: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung không được để trống"),
  delimiter: z.enum([",", "\t", ";", "|", "-"]).default(","),
  hasHeader: z.boolean().default(true),
  columnMapping: z.object({
    termIndex: z.number().int().min(0),
    readingIndex: z.number().int().min(0).optional(),
    definitionIndex: z.number().int().min(0),
    exampleIndex: z.number().int().min(0).optional(),
    exampleTranslationIndex: z.number().int().min(0).optional(),
    noteIndex: z.number().int().min(0).optional(),
    jlptLevelIndex: z.number().int().min(0).optional(),
  }),
  tags: z.array(z.string()).optional().default([]),
})

export type ImportCSVBody = z.infer<typeof ImportCSVSchema>

/**
 * Schema xuất dữ liệu bộ thẻ
 */
export const ExportSetSchema = z.object({
  setId: z.string().min(1),
  format: z.enum(["json", "csv", "anki"]).default("json"),
  includeMedia: z.boolean().default(false),
})

export type ExportSetQuery = z.infer<typeof ExportSetSchema>
