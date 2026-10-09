import bcrypt from "bcryptjs"
import { prisma } from "../src/lib/prisma"
import type {
  JLPTLevel,
  WordType,
  CardStatus,
  StudyMode,
} from "../src/generated/prisma/client"

// Danh sách màu tag đa dạng và hiện đại
const TAG_COLORS = {
  n5: "#3B82F6", // blue
  n4: "#10B981", // green
  vocab: "#8B5CF6", // purple
  kanji: "#EC4899", // pink
  grammar: "#F59E0B", // amber
  verb: "#EF4444", // red
  noun: "#06B6D4", // cyan
  adjective: "#14B8A6", // teal
  lesson1: "#6366F1", // indigo
  lesson2: "#84CC16", // lime
  lesson4: "#F97316", // orange
  lesson26: "#A855F7", // violet
}

async function main() {
  console.log(
    "🌱 [Seed] Bắt đầu nạp dữ liệu mẫu Minna no Nihongo, SRS và Thống kê 30 ngày..."
  )

  const adminEmail = "admin@nihomemo.local"

  // 1. Kiểm tra hoặc tạo User Admin
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123456", 10)
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Quản trị viên NihoMemo",
        password: hashedPassword,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        settings: {
          theme: "system",
          srsMode: "auto",
          dailyGoal: 25,
          keyboardShortcuts: true,
          ttsSpeed: 1.0,
          ttsVoice: "ja-JP",
        },
      },
    })
    console.log(`✅ [User] Đã tạo tài khoản Admin: ${admin.email}`)
  } else {
    console.log(`ℹ️ [User] Tài khoản Admin (${adminEmail}) đã tồn tại.`)
  }

  // 2. Thiết lập mục tiêu học tập (UserGoal) với chuỗi 30 ngày
  await prisma.userGoal.upsert({
    where: { userId: admin.id },
    update: {
      dailyCardTarget: 25,
      dailyTimeTarget: 20,
      currentStreak: 30,
      longestStreak: 30,
      lastStudyDate: new Date(),
    },
    create: {
      userId: admin.id,
      dailyCardTarget: 25,
      dailyTimeTarget: 20,
      currentStreak: 30,
      longestStreak: 30,
      lastStudyDate: new Date(),
    },
  })
  console.log("✅ [UserGoal] Đã cập nhật mục tiêu học tập & streak 30 ngày.")

  // 3. Khởi tạo danh sách Tags phổ biến
  const tagsData = [
    { name: "N5", color: TAG_COLORS.n5 },
    { name: "N4", color: TAG_COLORS.n4 },
    { name: "Từ vựng", color: TAG_COLORS.vocab },
    { name: "Kanji", color: TAG_COLORS.kanji },
    { name: "Ngữ pháp", color: TAG_COLORS.grammar },
    { name: "Động từ", color: TAG_COLORS.verb },
    { name: "Danh từ", color: TAG_COLORS.noun },
    { name: "Tính từ", color: TAG_COLORS.adjective },
    { name: "Bài 1", color: TAG_COLORS.lesson1 },
    { name: "Bài 2", color: TAG_COLORS.lesson2 },
    { name: "Bài 4", color: TAG_COLORS.lesson4 },
    { name: "Bài 26", color: TAG_COLORS.lesson26 },
  ]

  const tagMap = new Map<string, string>()
  for (const t of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { name_userId: { name: t.name, userId: admin.id } },
      update: { color: t.color },
      create: { name: t.name, color: t.color, userId: admin.id },
    })
    tagMap.set(t.name, tag.id)
  }
  console.log(`✅ [Tags] Đã nạp ${tagMap.size} nhãn phân loại.`)

  // 4. Cấu trúc thư mục (Folder Hierarchy)
  // Folder gốc 1: Minna no Nihongo
  let minnaFolder = await prisma.folder.findFirst({
    where: {
      userId: admin.id,
      name: "Minna no Nihongo (みんなの日本語)",
      parentId: null,
    },
  })
  if (!minnaFolder) {
    minnaFolder = await prisma.folder.create({
      data: {
        name: "Minna no Nihongo (みんなの日本語)",
        description: "Giáo trình tiếng Nhật sơ cấp Minna no Nihongo tiêu chuẩn",
        userId: admin.id,
        order: 1,
      },
    })
  }

  // Thư mục con N5 Bài 1-25
  let n5Folder = await prisma.folder.findFirst({
    where: {
      userId: admin.id,
      name: "Minna no Nihongo N5 (Bài 1 - 25)",
      parentId: minnaFolder.id,
    },
  })
  if (!n5Folder) {
    n5Folder = await prisma.folder.create({
      data: {
        name: "Minna no Nihongo N5 (Bài 1 - 25)",
        description: "Các bài học từ vựng trình độ N5 căn bản",
        parentId: minnaFolder.id,
        userId: admin.id,
        order: 1,
      },
    })
  }

  // Thư mục con N4 Bài 26-50
  let n4Folder = await prisma.folder.findFirst({
    where: {
      userId: admin.id,
      name: "Minna no Nihongo N4 (Bài 26 - 50)",
      parentId: minnaFolder.id,
    },
  })
  if (!n4Folder) {
    n4Folder = await prisma.folder.create({
      data: {
        name: "Minna no Nihongo N4 (Bài 26 - 50)",
        description: "Các bài học từ vựng trình độ N4 sơ trung cấp",
        parentId: minnaFolder.id,
        userId: admin.id,
        order: 2,
      },
    })
  }

  // Folder gốc 2: Kanji & Hán tự
  let kanjiFolder = await prisma.folder.findFirst({
    where: { userId: admin.id, name: "Hán tự & Kanji (漢字)", parentId: null },
  })
  if (!kanjiFolder) {
    kanjiFolder = await prisma.folder.create({
      data: {
        name: "Hán tự & Kanji (漢字)",
        description:
          "Tập hợp các chữ Hán N5 và N4 cần ghi nhớ kèm bộ thủ và nét viết",
        userId: admin.id,
        order: 2,
      },
    })
  }

  console.log("✅ [Folders] Đã thiết lập cấu trúc cây thư mục chuẩn.")

  // 5. Định nghĩa dữ liệu các bộ thẻ (Study Sets) mẫu
  const sampleSets = [
    {
      name: "Minna no Nihongo Bài 1: Chào hỏi & Giới thiệu bản thân",
      description:
        "Từ vựng đại từ nhân xưng, nghề nghiệp, quốc tịch căn bản trong bài 1",
      folderId: n5Folder.id,
      cards: [
        {
          term: "私",
          reading: "わたし",
          definition: "Tôi, bản thân tôi",
          example: "私は学生です。",
          exampleTranslation: "Tôi là học sinh/sinh viên.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
          radicals: "禾",
          strokeCount: 7,
          onReading: "シ",
          kunReading: "わたし、わたくし",
        },
        {
          term: "あなた",
          reading: "あなた",
          definition: "Bạn, anh, chị (ngôi thứ hai)",
          example: "あなたは会社員ですか。",
          exampleTranslation: "Bạn có phải là nhân viên công ty không?",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
        },
        {
          term: "あの人",
          reading: "あのひと",
          definition: "Người kia, người đó",
          example: "あの人はどなたですか。",
          exampleTranslation: "Người kia là vị nào thế ạ?",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
        },
        {
          term: "先生",
          reading: "せんせい",
          definition: "Thầy giáo, cô giáo, bác sĩ (dùng để gọi người khác)",
          example: "田中先生は日本語を教えます。",
          exampleTranslation: "Thầy Tanaka dạy tiếng Nhật.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1", "Kanji"],
          radicals: "生",
          strokeCount: 8,
          compounds: "先生 (せんせい), 先月 (せんげつ)",
        },
        {
          term: "学生",
          reading: "がくせい",
          definition: "Học sinh, sinh viên",
          example: "ミラーさんは大学の学生です。",
          exampleTranslation: "Anh Miller là sinh viên đại học.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1", "Kanji"],
          compounds: "大学 (だいがく), 学者 (がくしゃ)",
        },
        {
          term: "会社員",
          reading: "かいしゃいん",
          definition: "Nhân viên công ty nói chung",
          example: "父は会社員です。",
          exampleTranslation: "Bố tôi là nhân viên công ty.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
        },
        {
          term: "医者",
          reading: "いしゃ",
          definition: "Bác sĩ",
          example: "あの病院の医者はとても親切です。",
          exampleTranslation: "Bác sĩ của bệnh viện đó rất tốt bụng.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
        },
        {
          term: "研究者",
          reading: "けんきゅうしゃ",
          definition: "Nhà nghiên cứu",
          example: "彼はAIの研究者です。",
          exampleTranslation: "Anh ấy là nhà nghiên cứu trí tuệ nhân tạo.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
        },
        {
          term: "大学",
          reading: "だいがく",
          definition: "Trường đại học",
          example: "東京大学は有名です。",
          exampleTranslation: "Đại học Tokyo rất nổi tiếng.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1", "Kanji"],
        },
        {
          term: "病院",
          reading: "びょういん",
          definition: "Bệnh viện",
          example: "駅の近くに病院があります。",
          exampleTranslation: "Có một bệnh viện ở gần nhà ga.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 1"],
        },
      ],
    },
    {
      name: "Minna no Nihongo Bài 2: Đồ vật & Đại từ chỉ định",
      description:
        "Đại từ chỉ định これ・それ・あれ và các đồ dùng học tập, văn phòng phẩm",
      folderId: n5Folder.id,
      cards: [
        {
          term: "これ",
          reading: "これ",
          definition: "Cái này (vật gần người nói)",
          example: "これは私の本です。",
          exampleTranslation: "Đây là cuốn sách của tôi.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Bài 2"],
        },
        {
          term: "それ",
          reading: "それ",
          definition: "Cái đó (vật gần người nghe)",
          example: "それは何ですか。",
          exampleTranslation: "Đó là cái gì thế?",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Bài 2"],
        },
        {
          term: "あれ",
          reading: "あれ",
          definition: "Cái kia (vật xa cả người nói và người nghe)",
          example: "あれは富士山です。",
          exampleTranslation: "Kia là núi Phú Sĩ.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Bài 2"],
        },
        {
          term: "本",
          reading: "ほん",
          definition: "Quyển sách",
          example: "日本の歴史の本を読みます。",
          exampleTranslation: "Tôi đọc sách về lịch sử Nhật Bản.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2", "Kanji"],
          radicals: "木",
          strokeCount: 5,
          onReading: "ホン",
          kunReading: "もと",
        },
        {
          term: "辞書",
          reading: "じしょ",
          definition: "Từ điển",
          example: "電子辞書を使います。",
          exampleTranslation: "Tôi dùng từ điển điện tử.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2"],
        },
        {
          term: "雑誌",
          reading: "ざっし",
          definition: "Tạp chí",
          example: "毎週ファッションの雑誌を買います。",
          exampleTranslation: "Hàng tuần tôi đều mua tạp chí thời trang.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2"],
        },
        {
          term: "新聞",
          reading: "しんぶん",
          definition: "Tờ báo",
          example: "毎朝新聞を読みます。",
          exampleTranslation: "Mỗi sáng tôi đều đọc báo.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2"],
        },
        {
          term: "手帳",
          reading: "てちょう",
          definition: "Sổ tay cá nhân",
          example: "予定を手帳に書きます。",
          exampleTranslation: "Tôi ghi dự định vào sổ tay.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2"],
        },
        {
          term: "名刺",
          reading: "めいし",
          definition: "Danh thiếp",
          example: "お客様と名刺を交換します。",
          exampleTranslation: "Tôi trao đổi danh thiếp với khách hàng.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2"],
        },
        {
          term: "時計",
          reading: "とけい",
          definition: "Đồng hồ",
          example: "この時計はスイス製です。",
          exampleTranslation: "Chiếc đồng hồ này xuất xứ Thụy Sĩ.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 2"],
        },
      ],
    },
    {
      name: "Minna no Nihongo Bài 4: Thời gian & Động từ sinh hoạt",
      description: "Số đếm giờ phút và các động từ chỉ hoạt động thường nhật",
      folderId: n5Folder.id,
      cards: [
        {
          term: "起きます",
          reading: "おきます",
          definition: "Thức dậy",
          example: "毎朝六時に起きます。",
          exampleTranslation: "Mỗi sáng tôi thức dậy lúc 6 giờ.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N5", "Từ vựng", "Động từ", "Bài 4"],
        },
        {
          term: "寝ます",
          reading: "ねます",
          definition: "Đi ngủ",
          example: "夜十一時に寝ます。",
          exampleTranslation: "Buổi tối tôi đi ngủ lúc 11 giờ.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N5", "Từ vựng", "Động từ", "Bài 4"],
        },
        {
          term: "働きます",
          reading: "はたらきます",
          definition: "Làm việc",
          example: "月曜日から金曜日まで働きます。",
          exampleTranslation: "Tôi làm việc từ thứ Hai đến thứ Sáu.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N5", "Từ vựng", "Động từ", "Bài 4"],
        },
        {
          term: "休みます",
          reading: "やすみます",
          definition: "Nghỉ ngơi, nghỉ ngơi ở nhà",
          example: "日曜日会社を休みます。",
          exampleTranslation: "Chủ nhật tôi nghỉ làm ở công ty.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N5", "Từ vựng", "Động từ", "Bài 4"],
        },
        {
          term: "勉強します",
          reading: "べんきょうします",
          definition: "Học tập",
          example: "毎晩日本語を二時間勉強します。",
          exampleTranslation: "Mỗi tối tôi học tiếng Nhật hai tiếng đồng hồ.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N5", "Từ vựng", "Động từ", "Bài 4"],
        },
        {
          term: "終わります",
          reading: "おわります",
          definition: "Kết thúc, hoàn thành",
          example: "会議は五時に終わります。",
          exampleTranslation: "Cuộc họp kết thúc lúc 5 giờ.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N5", "Từ vựng", "Động từ", "Bài 4"],
        },
        {
          term: "午前",
          reading: "ごぜん",
          definition: "Buổi sáng (AM)",
          example: "午前九時から仕事を始めます。",
          exampleTranslation: "Tôi bắt đầu công việc từ 9 giờ sáng.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 4"],
        },
        {
          term: "午後",
          reading: "ごご",
          definition: "Buổi chiều (PM)",
          example: "午後一時からテストがあります。",
          exampleTranslation: "Có bài kiểm tra từ 1 giờ chiều.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Noun" as WordType,
          tags: ["N5", "Từ vựng", "Danh từ", "Bài 4"],
        },
      ],
    },
    {
      name: "Minna no Nihongo Bài 26: Thể thông thường + んです",
      description:
        "Từ vựng N4 bài 26 dùng trong ngữ cảnh giải thích lý do, tình huống",
      folderId: n4Folder.id,
      cards: [
        {
          term: "見ます",
          reading: "みます",
          definition: "Xem xét, khám bệnh, kiểm tra",
          example: "医者に診てもらいます。",
          exampleTranslation: "Được bác sĩ khám cho.",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N4", "Từ vựng", "Động từ", "Bài 26"],
        },
        {
          term: "探します",
          reading: "さがします",
          definition: "Tìm kiếm (vật bị mất, đồ đạc, công việc)",
          example: "鍵を探しているんです。",
          exampleTranslation:
            "Tôi đang tìm chìa khóa (nên mới lúng túng thế này).",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N4", "Từ vựng", "Động từ", "Bài 26"],
        },
        {
          term: "遅れます",
          reading: "おくれます",
          definition: "Chậm trễ, muộn (giờ)",
          example: "時間に遅れないでください。",
          exampleTranslation: "Xin đừng đến muộn giờ.",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N4", "Từ vựng", "Động từ", "Bài 26"],
        },
        {
          term: "間に合います",
          reading: "まにあいます",
          definition: "Kịp thời gian, kịp tàu xe",
          example: "新幹線に間に合いました。",
          exampleTranslation: "Tôi đã kịp chuyến tàu Shinkansen.",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N4", "Từ vựng", "Động từ", "Bài 26"],
        },
        {
          term: "連絡します",
          reading: "れんらくします",
          definition: "Liên lạc, thông báo",
          example: "後で先生に連絡します。",
          exampleTranslation: "Lát nữa tôi sẽ liên lạc với thầy giáo.",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "Verb" as WordType,
          tags: ["N4", "Từ vựng", "Động từ", "Bài 26"],
        },
        {
          term: "都合がいい",
          reading: "つごうがいい",
          definition: "Thuận tiện về mặt thời gian, thuận lợi",
          example: "明日は都合がいいですか。",
          exampleTranslation: "Ngày mai bạn có tiện thời gian không?",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "IAdjective" as WordType,
          tags: ["N4", "Từ vựng", "Tính từ", "Bài 26"],
        },
        {
          term: "気分がいい",
          reading: "きぶんがいい",
          definition: "Tâm trạng thoải mái, cơ thể sảng khoái",
          example: "天気が良くて気分がいいです。",
          exampleTranslation: "Thời tiết đẹp nên tâm trạng thật sảng khoái.",
          jlptLevel: "N4" as JLPTLevel,
          wordType: "IAdjective" as WordType,
          tags: ["N4", "Từ vựng", "Tính từ", "Bài 26"],
        },
      ],
    },
    {
      name: "Kanji N5: 12 Chữ Hán Căn Bản Nhất",
      description:
        "Bộ chữ Hán cơ bản thường gặp nhất trong kỳ thi JLPT N5 kèm chi tiết bộ thủ và âm On-Kun",
      folderId: kanjiFolder.id,
      cards: [
        {
          term: "日",
          reading: "ひ、にち",
          definition: "Mặt trời, ngày (Nhật)",
          example: "日曜日に友達と会います。",
          exampleTranslation: "Vào chủ nhật tôi gặp gỡ bạn bè.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "日",
          strokeCount: 4,
          onReading: "ニチ、ジツ",
          kunReading: "ひ、-び、-か",
          compounds: "日本 (にほん), 毎日 (まいにち), 休日 (きゅうじつ)",
        },
        {
          term: "月",
          reading: "つき、げつ",
          definition: "Mặt trăng, tháng (Nguyệt)",
          example: "今夜は月がきれいです。",
          exampleTranslation: "Tối nay trăng thật đẹp.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "月",
          strokeCount: 4,
          onReading: "ゲツ、ガツ",
          kunReading: "つき",
          compounds: "今月 (こんげつ), 月曜日 (げつようび), 一月 (いちがつ)",
        },
        {
          term: "火",
          reading: "ひ、か",
          definition: "Lửa (Hỏa)",
          example: "火を消してください。",
          exampleTranslation: "Xin vui lòng tắt lửa đi.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "火",
          strokeCount: 4,
          onReading: "カ",
          kunReading: "ひ、-び、ほ-",
          compounds: "火曜日 (かようび), 花火 (はなび), 火山 (かざん)",
        },
        {
          term: "水",
          reading: "みず、すい",
          definition: "Nước (Thủy)",
          example: "冷たい水を一杯ください。",
          exampleTranslation: "Cho tôi xin một cốc nước lạnh.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "水",
          strokeCount: 4,
          onReading: "スイ",
          kunReading: "みず",
          compounds: "水曜日 (すいようび), 水泳 (すいえい)",
        },
        {
          term: "木",
          reading: "き、もく",
          definition: "Cây gỗ (Mộc)",
          example: "公園に大きな木があります。",
          exampleTranslation: "Ở công viên có một cái cây rất to.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "木",
          strokeCount: 4,
          onReading: "ボク、モク",
          kunReading: "き、こ-",
          compounds: "木曜日 (もくようび), 木造 (もくぞう)",
        },
        {
          term: "金",
          reading: "かね、きん",
          definition: "Vàng, tiền bạc (Kim)",
          example: "お金を大切にします。",
          exampleTranslation: "Tôi trân trọng tiền bạc.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "金",
          strokeCount: 8,
          onReading: "キン、コン",
          kunReading: "かね、かな-",
          compounds: "金曜日 (きんようび), 料金 (りょうきん)",
        },
        {
          term: "土",
          reading: "つち、ど",
          definition: "Đất đai (Thổ)",
          example: "土の香りがします。",
          exampleTranslation: "Có mùi hương của đất.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "土",
          strokeCount: 3,
          onReading: "ド、ト",
          kunReading: "つち",
          compounds: "土曜日 (どようび), 土地 (とち)",
        },
        {
          term: "人",
          reading: "ひと、じん、にん",
          definition: "Người (Nhân)",
          example: "あの人は優しい人です。",
          exampleTranslation: "Người kia là một người hiền lành.",
          jlptLevel: "N5" as JLPTLevel,
          wordType: "Kanji" as WordType,
          tags: ["N5", "Kanji"],
          radicals: "人",
          strokeCount: 2,
          onReading: "ジン、ニン",
          kunReading: "ひと",
          compounds: "日本人 (にほんじん), 三人 (さんにん), 大人 (おとな)",
        },
      ],
    },
  ]

  const createdCardsList: Array<{ id: string; term: string }> = []
  const createdSetsList: Array<{ id: string; name: string }> = []

  for (const setInfo of sampleSets) {
    // Xóa set trùng tên nếu có để nạp lại sạch sẽ
    const existing = await prisma.studySet.findFirst({
      where: { userId: admin.id, name: setInfo.name },
    })
    if (existing) {
      await prisma.studySet.delete({ where: { id: existing.id } })
    }

    const createdSet = await prisma.studySet.create({
      data: {
        name: setInfo.name,
        description: setInfo.description,
        sourceLanguage: "ja",
        targetLanguage: "vi",
        folderId: setInfo.folderId,
        userId: admin.id,
        cardCount: setInfo.cards.length,
      },
    })
    createdSetsList.push(createdSet)

    for (let i = 0; i < setInfo.cards.length; i++) {
      const c = setInfo.cards[i]
      const card = await prisma.card.create({
        data: {
          studySetId: createdSet.id,
          term: c.term,
          reading: c.reading,
          definition: c.definition,
          example: c.example,
          exampleTranslation: c.exampleTranslation,
          jlptLevel: c.jlptLevel,
          wordType: c.wordType,
          radicals: c.radicals || null,
          strokeCount: c.strokeCount || null,
          onReading: c.onReading || null,
          kunReading: c.kunReading || null,
          compounds: c.compounds || null,
          order: i,
        },
      })
      createdCardsList.push({ id: card.id, term: card.term })

      // Gán tags
      for (const tagName of c.tags) {
        const tagId = tagMap.get(tagName)
        if (tagId) {
          await prisma.cardTag.create({
            data: { cardId: card.id, tagId },
          })
        }
      }

      // Tạo trạng thái SRS đa dạng mô phỏng quá trình học thực tế
      // Phân chia theo chỉ số modulo:
      // i % 4 === 0: Mastered (Đã thuộc kỹ, interval lớn)
      // i % 4 === 1: Review (Cần ôn tập trong hôm nay hoặc ngày mai)
      // i % 4 === 2: Learning (Đang học, interval 1-2 ngày)
      // i % 4 === 3: New (Thẻ mới tinh, chưa học)
      let srsStatus: CardStatus = "New"
      let repetitions = 0
      let interval = 0
      let easeFactor = 2.5
      let correctCount = 0
      let incorrectCount = 0
      let nextReviewDate = new Date()
      let lastReviewDate: Date | null = null

      const mod = i % 4
      if (mod === 0) {
        srsStatus = "Mastered"
        repetitions = 6
        interval = 28
        easeFactor = 2.7
        correctCount = 12
        incorrectCount = 1
        lastReviewDate = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        nextReviewDate = new Date(Date.now() + 24 * 24 * 60 * 60 * 1000)
      } else if (mod === 1) {
        srsStatus = "Review"
        repetitions = 3
        interval = 3
        easeFactor = 2.4
        correctCount = 5
        incorrectCount = 2
        lastReviewDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        // Đến hạn hôm nay
        nextReviewDate = new Date(Date.now() - 2 * 60 * 60 * 1000)
      } else if (mod === 2) {
        srsStatus = "Learning"
        repetitions = 1
        interval = 1
        easeFactor = 2.3
        correctCount = 2
        incorrectCount = 2
        lastReviewDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        // Đến hạn sớm
        nextReviewDate = new Date(Date.now() + 6 * 60 * 60 * 1000)
      } else {
        srsStatus = "New"
        repetitions = 0
        interval = 0
        easeFactor = 2.5
        correctCount = 0
        incorrectCount = 0
        lastReviewDate = null
        nextReviewDate = new Date()
      }

      await prisma.sRSData.create({
        data: {
          cardId: card.id,
          userId: admin.id,
          status: srsStatus,
          repetitions,
          interval,
          easeFactor,
          correctCount,
          incorrectCount,
          lastReviewDate,
          nextReviewDate,
        },
      })
    }
  }

  console.log(
    `✅ [Sets & Cards] Đã tạo ${createdSetsList.length} bộ thẻ với tổng cộng ${createdCardsList.length} thẻ từ vựng & Kanji.`
  )

  // 6. Tạo Study Sessions mẫu phong phú
  // Xóa các session cũ của admin để nạp lại
  await prisma.studySession.deleteMany({ where: { userId: admin.id } })

  const modes: StudyMode[] = [
    "Flashcard",
    "Learn",
    "Test",
    "Match",
    "Write",
    "Listen",
  ]
  const now = new Date()

  for (let s = 1; s <= 20; s++) {
    const mode = modes[s % modes.length]
    const targetSet = createdSetsList[s % createdSetsList.length]
    const daysAgo = Math.floor(s * 1.4)
    const sessionDate = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 3600000
    )
    const duration = 180 + Math.floor(Math.random() * 600) // 3 - 13 phút
    const total = 10 + Math.floor(Math.random() * 15)
    const correct = Math.floor(total * (0.75 + Math.random() * 0.23))
    const incorrect = total - correct
    const score = Number(((correct / total) * 100).toFixed(1))

    await prisma.studySession.create({
      data: {
        userId: admin.id,
        studySetId: targetSet.id,
        mode,
        startedAt: sessionDate,
        endedAt: new Date(sessionDate.getTime() + duration * 1000),
        duration,
        totalCards: total,
        correctCards: correct,
        incorrectCards: incorrect,
        score,
      },
    })
  }
  console.log(
    "✅ [StudySessions] Đã nạp 20 phiên học tập mẫu trải dài các chế độ."
  )

  // 7. Tạo DailyStats cho 30 ngày liên tục (phục vụ streak & GitHub-like heatmap)
  await prisma.dailyStats.deleteMany({ where: { userId: admin.id } })

  for (let d = 29; d >= 0; d--) {
    const dayDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
    const yyyy = dayDate.getFullYear()
    const mm = String(dayDate.getMonth() + 1).padStart(2, "0")
    const dd = String(dayDate.getDate()).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`

    const studied = 15 + Math.floor(Math.random() * 25) // 15 - 40 thẻ
    const correct = Math.floor(studied * (0.8 + Math.random() * 0.18))
    const incorrect = studied - correct
    const timeSpent = studied * (18 + Math.floor(Math.random() * 15)) // 5 - 20 phút
    const newCards = Math.floor(Math.random() * 8) + 2
    const reviewCards = studied - newCards
    const streakVal = 30 - d // Chuỗi tăng dần từ 1 đến 30 ngày liên tiếp

    await prisma.dailyStats.create({
      data: {
        userId: admin.id,
        date: dateStr,
        cardsStudied: studied,
        cardsCorrect: correct,
        cardsIncorrect: incorrect,
        timeSpent,
        newCardsSeen: newCards,
        reviewCards,
        streak: streakVal,
      },
    })
  }
  console.log(
    "✅ [DailyStats] Đã nạp 30 ngày thống kê liên tục với chuỗi Streak 30 ngày."
  )

  console.log("✨✨✨ HOÀN THÀNH SEED DỮ LIỆU PHASE 8 THÀNH CÔNG! ✨✨✨")
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi chạy seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
