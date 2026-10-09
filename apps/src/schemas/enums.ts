import { z } from "zod"
import { CARD_STATUSES, JLPT_LEVELS, STUDY_MODES, WORD_TYPES } from "@/types"

/**
 * Zod schemas cho các Enum hệ thống
 */
export const JLPTLevelSchema = z.enum(JLPT_LEVELS)
export const WordTypeSchema = z.enum(WORD_TYPES)
export const CardStatusSchema = z.enum(CARD_STATUSES)
export const StudyModeSchema = z.enum(STUDY_MODES)
