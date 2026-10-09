import { describe, it, expect } from "vitest"
import {
  detectDelimiter,
  parseCSVRows,
  guessColumnMapping,
  parseCSVContent,
  previewCSV,
} from "@/lib/parsers/csv"
import {
  detectTextSeparators,
  parseTextContent,
  previewText,
} from "@/lib/parsers/text"

describe("Kiểm thử Parsers (Bộ phân tích CSV, TSV và Text thuần)", () => {
  describe("1. CSV & TSV Parser", () => {
    it("Tự động nhận diện chính xác delimiter (dấu phẩy, tab, chấm phẩy)", () => {
      const csvData = "term,reading,definition\n私,わたし,Tôi\n本,ほん,Sách"
      expect(detectDelimiter(csvData)).toBe(",")

      const tsvData =
        "term\treading\tdefinition\n私\tわたし\tTôi\n本\tほん\tSách"
      expect(detectDelimiter(tsvData)).toBe("\t")

      const semiData = "term;reading;definition\n私;わたし;Tôi\n本;ほん;Sách"
      expect(detectDelimiter(semiData)).toBe(";")
    })

    it("Phân tích dòng CSV có chứa dấu ngoặc kép và dấu phân cách lồng nhau", () => {
      const complexCSV =
        'term,definition\n"私, 自分","Tôi, chính bản thân tôi"\n"これ","Cái này"'
      const rows = parseCSVRows(complexCSV, ",")

      expect(rows.length).toBe(3)
      expect(rows[0]).toEqual(["term", "definition"])
      expect(rows[1]).toEqual(["私, 自分", "Tôi, chính bản thân tôi"])
      expect(rows[2]).toEqual(["これ", "Cái này"])
    })

    it('Xử lý escape double-quote trong ô CSV (ví dụ: ""abc"")', () => {
      const quoteCSV = 'term,definition\n"Từ có ""ngoặc kép""","Giải nghĩa"'
      const rows = parseCSVRows(quoteCSV, ",")
      expect(rows[1][0]).toBe('Từ có "ngoặc kép"')
      expect(rows[1][1]).toBe("Giải nghĩa")
    })

    it("Gợi ý đúng vị trí cột dựa trên tiêu đề tiếng Nhật, Anh và Việt", () => {
      const headers = ["Từ vựng", "Cách đọc", "Ý nghĩa", "Ví dụ", "Tags"]
      const mapping = guessColumnMapping(headers)

      expect(mapping.termIndex).toBe(0)
      expect(mapping.readingIndex).toBe(1)
      expect(mapping.definitionIndex).toBe(2)
      expect(mapping.exampleIndex).toBe(3)
      expect(mapping.tagsIndex).toBe(4)
    })

    it("Parse hoàn chỉnh nội dung CSV thành danh sách thẻ kèm xử lý tags", () => {
      const content = `Term,Reading,Definition,Tags
学生,がくせい,"Học sinh, sinh viên",#N5 #TừVựng
先生,せんせい,Thầy cô giáo,#N5`

      const cards = parseCSVContent(content, {
        delimiter: ",",
        hasHeader: true,
        columnMapping: {
          termIndex: 0,
          readingIndex: 1,
          definitionIndex: 2,
          tagsIndex: 3,
        },
      })

      expect(cards.length).toBe(2)
      expect(cards[0].term).toBe("学生")
      expect(cards[0].reading).toBe("がくせい")
      expect(cards[0].definition).toBe("Học sinh, sinh viên")
      expect(cards[0].tags).toEqual(["N5", "TừVựng"])
      expect(cards[1].tags).toEqual(["N5"])
    })

    it("Tự động trích xuất reading từ term nếu có ngoặc đơn: 食べる（たべる）", () => {
      const content = `食べる（たべる）,Ăn`
      const cards = parseCSVContent(content, {
        delimiter: ",",
        hasHeader: false,
        columnMapping: {
          termIndex: 0,
          definitionIndex: 1,
        },
      })

      expect(cards.length).toBe(1)
      expect(cards[0].reading).toBe("たべる")
      expect(cards[0].definition).toBe("Ăn")
    })

    it("Hàm previewCSV tạo bản xem trước đầy đủ thông tin", () => {
      const content = `Từ vựng,Nghĩa\n猫,Con mèo\n犬,Con chó`
      const preview = previewCSV(content)

      expect(preview.hasHeader).toBe(true)
      expect(preview.totalRows).toBe(2)
      expect(preview.sampleRows.length).toBe(2)
      expect(preview.detectedDelimiter).toBe(",")
    })
  })

  describe("2. Plain Text Parser", () => {
    it("Nhận diện chính xác dấu phân cách gạch nối ' - '", () => {
      const text = "私 - Tôi\n本 - Sách\n車 - Xe hơi"
      const { termSeparator } = detectTextSeparators(text)
      expect(termSeparator).toBe(" - ")

      const cards = parseTextContent(text)
      expect(cards.length).toBe(3)
      expect(cards[0].term).toBe("私")
      expect(cards[0].definition).toBe("Tôi")
      expect(cards[2].term).toBe("車")
      expect(cards[2].definition).toBe("Xe hơi")
    })

    it("Tự động trích xuất reading từ ngoặc đơn trong text: 日本語（にほんご）", () => {
      const text = "日本語（にほんご） - Tiếng Nhật"
      const cards = parseTextContent(text)

      expect(cards.length).toBe(1)
      expect(cards[0].term).toBe("日本語")
      expect(cards[0].reading).toBe("にほんご")
      expect(cards[0].definition).toBe("Tiếng Nhật")
    })

    it("Hàm previewText trả về kết quả xem trước hợp lệ", () => {
      const text = "林檎 - Quả táo\n蜜柑 - Quả quýt"
      const preview = previewText(text)

      expect(preview.totalCards).toBe(2)
      expect(preview.sampleCards.length).toBe(2)
      expect(preview.detectedTermSeparator).toBe(" - ")
    })
  })
})
