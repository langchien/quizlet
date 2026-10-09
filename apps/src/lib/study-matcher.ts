/**
 * Bộ công cụ so khớp đáp án thông minh cho các chế độ học (Write, Test, Listen)
 * Hỗ trợ:
 * - Đa nghĩa tiếng Việt (phân cách bởi dấu phẩy, chấm phẩy, gạch chéo, "hoặc")
 * - Tự động loại bỏ chú thích trong ngoặc đơn ở nghĩa tiếng Việt
 * - Tiếng Nhật: Tự động bóc tách Kanji và Kana trong ngoặc, khoảng trắng, tiền tố/hậu tố (〜, -, ...)
 */

/**
 * Chuẩn hóa chuỗi cơ bản: bỏ khoảng trắng thừa, đưa về chữ thường
 */
export function normalizeBase(str: string): string {
  if (!str) return ""
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, " ") // chuẩn hoá khoảng trắng
}

/**
 * Chuẩn hoá chuỗi tiếng Việt: bỏ các dấu câu ở cuối hoặc ngăn cách
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return ""
  return str
    .trim()
    .toLowerCase()
    .replace(/[、。，,.;:!?！？…~〜\-—]/g, "") // bỏ dấu câu
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Chuẩn hóa chuỗi tiếng Nhật: bỏ khoảng trắng, dấu câu tiếng Nhật
 */
export function normalizeJapanese(str: string): string {
  if (!str) return ""
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[、。，,.;:!?！？…\(\)（）]/g, "")
}

/**
 * Tách danh sách các nghĩa tiếng Việt được chấp nhận từ chuỗi `definition`
 * Ví dụ:
 * - "thầy, cô" -> ["thầy", "cô", "thầy, cô"]
 * - "bé (dùng cho nam) hoặc gọi thân mật." -> ["bé", "gọi thân mật", "bé hoặc gọi thân mật"]
 * - "sân ga số -" -> ["sân ga số -", "sân ga số"]
 */
export function extractAcceptedVietnameseMeanings(definition: string): string[] {
  if (!definition) return []

  const results = new Set<string>()

  // 1. Bản gốc chuẩn hoá
  const origClean = normalizeVietnamese(definition)
  if (origClean) results.add(origClean)

  // 2. Tách theo các dấu phân cách phổ biến: dấu phẩy, chấm phẩy, gạch chéo, xuống dòng
  const rawParts = definition.split(/[,;/\n、，]/)

  for (const rawPart of rawParts) {
    const part = rawPart.trim()
    if (!part) continue

    // Thêm phân đoạn đã chuẩn hoá
    const partClean = normalizeVietnamese(part)
    if (partClean) results.add(partClean)

    // Bóc tách nếu có chứa từ "hoặc"
    if (part.includes(" hoặc ")) {
      const orParts = part.split(/\s+hoặc\s+/i)
      for (const op of orParts) {
        const opClean = normalizeVietnamese(op)
        if (opClean) results.add(opClean)
      }
    }

    // Bóc tách bỏ phần trong ngoặc: "(...)" hoặc "（...）"
    // Ví dụ: "bé (dùng cho nam)" -> "bé"
    const withoutParens = part.replace(/\([^)]*\)|（[^）]*）/g, "").trim()
    if (withoutParens && withoutParens !== part) {
      const wpClean = normalizeVietnamese(withoutParens)
      if (wpClean) results.add(wpClean)

      // Nếu phần sau khi bỏ ngoặc vẫn chứa "hoặc"
      if (withoutParens.includes(" hoặc ")) {
        const wpOrParts = withoutParens.split(/\s+hoặc\s+/i)
        for (const op of wpOrParts) {
          const opClean = normalizeVietnamese(op)
          if (opClean) results.add(opClean)
        }
      }
    }

    // Nếu từ có đuôi gạch nối kiểu "sân ga số -" -> chấp nhận cả "sân ga số"
    const withoutDash = part.replace(/[-—~〜]+$/, "").trim()
    if (withoutDash && withoutDash !== part) {
      const wdClean = normalizeVietnamese(withoutDash)
      if (wdClean) results.add(wdClean)
    }
  }

  // Loại bỏ các nghĩa quá ngắn vô nghĩa (trừ khi bản gốc ngắn)
  return Array.from(results).filter((r) => r.length > 0)
}

/**
 * Tách danh sách các dạng tiếng Nhật được chấp nhận từ `term` và `reading`
 * Ví dụ:
 * - term: "せんせい（先生）" -> ["せんせい（先生）", "せんせい", "先生"]
 * - term: "～くん ～君" -> ["～くん ～君", "～くん", "～君", "くん", "君"]
 * - term: "ーばんせん" -> ["ーばんせん", "ばんせん"]
 */
export function extractAcceptedJapaneseAnswers(
  term: string,
  reading?: string | null
): string[] {
  const candidates: string[] = []
  if (term) candidates.push(term)
  if (reading && reading !== term) candidates.push(reading)

  const results = new Set<string>()

  for (const text of candidates) {
    if (!text) continue

    // 1. Thêm bản thân chuỗi sau khi chuẩn hóa
    const clean = normalizeJapanese(text)
    if (clean) results.add(clean)

    // 2. Nếu có dấu ngoặc: A（B）hoặc A(B)
    const match = text.match(/^(.*?)[（\(](.*?)[）\)](.*?)$/)
    if (match) {
      const before = match[1].trim()
      const inside = match[2].trim()
      const after = match[3].trim()

      const part1 = normalizeJapanese(before + after)
      const part2 = normalizeJapanese(inside + after)
      if (part1) results.add(part1)
      if (part2) results.add(part2)
    }

    // 3. Nếu phân tách bởi khoảng trắng (ví dụ "～くん ～君")
    const spaceParts = text.split(/[\s\u3000]+/)
    if (spaceParts.length > 1) {
      for (const sp of spaceParts) {
        const spClean = normalizeJapanese(sp)
        if (spClean) results.add(spClean)
      }
    }

    // 4. Bỏ các ký tự tiền tố/hậu tố: "～", "〜", "-", "ー", "~"
    // Ví dụ: "～くん" -> "くん", "ーばんせん" -> "ばんせん"
    const strippedPrefix = text.replace(/^[～〜\-ー~]+/, "").trim()
    if (strippedPrefix && strippedPrefix !== text) {
      const spClean = normalizeJapanese(strippedPrefix)
      if (spClean) results.add(spClean)
    }
  }

  return Array.from(results).filter((r) => r.length > 0)
}

/**
 * Kiểm tra câu trả lời của người học có chính xác không
 */
export function isStudyAnswerCorrect({
  userAnswer,
  card,
  isReverse,
}: {
  userAnswer: string
  card: {
    term: string
    reading?: string | null
    definition: string
  }
  isReverse: boolean // false: hỏi nghĩa -> gõ tiếng Nhật; true: hỏi tiếng Nhật -> gõ tiếng Việt
}): boolean {
  if (!userAnswer || !userAnswer.trim()) return false

  if (isReverse) {
    // Người học gõ tiếng Việt: so sánh với danh sách nghĩa được chấp nhận
    const typedClean = normalizeVietnamese(userAnswer)
    if (!typedClean) return false

    const acceptedMeanings = extractAcceptedVietnameseMeanings(card.definition)

    // 1. So khớp chính xác với bất kỳ nghĩa nào
    if (acceptedMeanings.some((m) => m === typedClean)) {
      return true
    }

    // 2. So khớp không khoảng trắng (phòng trường hợp gõ "thầycô" thay vì "thầy cô")
    const typedNoSpace = typedClean.replace(/\s+/g, "")
    if (
      acceptedMeanings.some((m) => m.replace(/\s+/g, "") === typedNoSpace)
    ) {
      return true
    }

    return false
  } else {
    // Người học gõ tiếng Nhật: so sánh với các biến thể của term và reading
    const typedClean = normalizeJapanese(userAnswer)
    if (!typedClean) return false

    const acceptedAnswers = extractAcceptedJapaneseAnswers(
      card.term,
      card.reading
    )

    // So khớp với bất kỳ biến thể tiếng Nhật nào
    return acceptedAnswers.some((ans) => ans === typedClean)
  }
}
