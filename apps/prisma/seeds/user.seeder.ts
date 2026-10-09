import bcrypt from "bcryptjs"
import type { PrismaClient, User } from "../../src/generated/prisma/client"

export const ADMIN_EMAIL = "admin@nihomemo.local"

export async function seedUserAndGoal(prisma: PrismaClient): Promise<User> {
  // 1. Kiểm tra hoặc tạo User Admin
  let admin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })

  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123456", 10)
    admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
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
    console.log(`ℹ️ [User] Tài khoản Admin (${ADMIN_EMAIL}) đã tồn tại.`)
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

  return admin
}
