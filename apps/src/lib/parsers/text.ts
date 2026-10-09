export interface TextParsedCard {
  term: string
  reading: string
  definition: string
  tags: string[]
}

export interface TextPreviewResult {
  totalCards: number
  sampleCards: TextParsedCard[]
  detectedTermSeparator: string
  detectedCardSeparator: string
}

/**
 * Tự động đoán dấu phân cách giữa các thẻ và giữa Term / Definition
 */
export function detectTextSeparators(content: string): {
  termSeparator: string
  cardSeparator: string
} {
  const cardSeparator = "\n"

  // Kiểm tra tần suất của Tab, Dash '-', Dash '–', Colon ':', Comma ','
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { termSeparator: "\t", cardSeparator: "\n" }

  const tabCount = lines.filter((l) => l.includes("\t")).length
  const dashCount = lines.filter(
    (l) => l.includes(" - ") || l.includes(" – ")
  ).length
  const colonCount = lines.filter(
    (l) => l.includes(" : ") || l.includes(":")
  ).length

  let termSeparator = "\t"
  if (tabCount >= lines.length * 0.5) {
    termSeparator = "\t"
  } else if (dashCount >= lines.length * 0.5) {
    termSeparator = " - "
  } else if (colonCount >= lines.length * 0.5) {
    termSeparator = ":"
  }

  return { termSeparator, cardSeparator }
}

/**
 * Parse nội dung văn bản thuần thành danh sách thẻ học
 */
export function parseTextContent(
  content: string,
  options?: {
    termSeparator?: string
    cardSeparator?: string
  }
): TextParsedCard[] {
  const detected = detectTextSeparators(content)
  const cardSep = options?.cardSeparator || detected.cardSeparator
  const termSep = options?.termSeparator || detected.termSeparator

  const blocks = content
    .split(cardSep)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)

  const cards: TextParsedCard[] = []

  for (const block of blocks) {
    let term = ""
    let definition = ""

    if (termSep && block.includes(termSep)) {
      const parts = block.split(termSep)
      term = parts[0]?.trim() || ""
      definition = parts.slice(1).join(termSep).trim()
    } else if (block.includes("\t")) {
      const parts = block.split("\t")
      term = parts[0]?.trim() || ""
      definition = parts.slice(1).join("\t").trim()
    } else if (block.includes(" - ")) {
      const parts = block.split(" - ")
      term = parts[0]?.trim() || ""
      definition = parts.slice(1).join(" - ").trim()
    } else {
      // Nếu không có dấu phân cách rõ ràng, coi cả dòng là term
      term = block
      definition = block
    }

    if (!term && !definition) continue

    // Tách cách đọc nếu có dấu ngoặc đơn hoặc ngoặc Nhật: 日本語（にほんご）
    let reading = ""
    const match = term.match(/^(.*?)[(（]([^(（)）]+)[)）]$/)
    if (match) {
      term = match[1].trim()
      reading = match[2].trim()
    }

    cards.push({
      term: term || definition || "Chưa có tiêu đề",
      reading: reading || term,
      definition: definition || term,
      tags: [],
    })
  }

  return cards
}

/**
 * Tạo dữ liệu xem trước cho Import Text
 */
export function previewText(
  content: string,
  options?: {
    termSeparator?: string
    cardSeparator?: string
  }
): TextPreviewResult {
  const detected = detectTextSeparators(content)
  const termSeparator = options?.termSeparator || detected.termSeparator
  const cardSeparator = options?.cardSeparator || detected.cardSeparator

  const cards = parseTextContent(content, { termSeparator, cardSeparator })

  return {
    totalCards: cards.length,
    sampleCards: cards.slice(0, 10),
    detectedTermSeparator: termSeparator,
    detectedCardSeparator: cardSeparator,
  }
}
