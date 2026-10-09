import { prisma } from "../src/lib/prisma"
import {
  seedUserAndGoal,
  seedFolders,
  loadRawCardSets,
  seedTagsFromSets,
  seedCardsAndSets,
  seedStudySessions,
  seedDailyStats,
} from "./seeds"

async function main() {
  console.log("🌱 [Seed] Bắt đầu quy trình nạp dữ liệu NihoMemo...")

  // 1. Khởi tạo tài khoản Quản trị viên (Admin) và Mục tiêu học tập (UserGoal)
  const admin = await seedUserAndGoal(prisma)

  // 2. Thiết lập cây thư mục giáo trình Minna no Nihongo
  const { n5Folder, folderMap } = await seedFolders(prisma, admin.id)

  // 3. Quét và tải toàn bộ dữ liệu bộ thẻ từ thư mục data/cards
  const rawSets = loadRawCardSets()

  // 4. Khởi tạo các nhãn phân loại (Tags) dựa trên dữ liệu bài học
  const tagMap = await seedTagsFromSets(prisma, admin.id, rawSets)

  // 5. Nạp danh sách bộ thẻ, thẻ từ vựng và thiết lập thuật toán SRS
  const createdSets = await seedCardsAndSets(
    prisma,
    admin.id,
    rawSets,
    n5Folder.id,
    folderMap,
    tagMap
  )

  // 6. Nạp 25 phiên học tập mẫu trải dài các chế độ học (Study Sessions)
  await seedStudySessions(prisma, admin.id, createdSets)

  // 7. Nạp dữ liệu thống kê 30 ngày liên tục (Daily Stats & Streak Heatmap)
  await seedDailyStats(prisma, admin.id)

  console.log("✨✨✨ HOÀN THÀNH SEED DỮ LIỆU TỪ DATA/CARDS THÀNH CÔNG! ✨✨✨")
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi chạy seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
