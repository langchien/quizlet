import bcrypt from "bcryptjs"
import { prisma } from "../src/lib/prisma"

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu ban đầu (Seed database)...")

  // Xóa dữ liệu cũ nếu có
  const adminEmail = "admin@nihomemo.local"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123456", 10)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Quản trị viên NihoMemo",
        password: hashedPassword,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        settings: {
          theme: "system",
          srsMode: "auto",
          dailyGoal: 20,
          keyboardShortcuts: true,
        },
        goal: {
          create: {
            dailyCardTarget: 20,
            dailyTimeTarget: 15,
            currentStreak: 1,
            longestStreak: 1,
            lastStudyDate: new Date(),
          },
        },
      },
    })

    console.log(
      `✅ Đã tạo tài khoản Admin mặc định: ${admin.email} (Mật khẩu: admin123456)`
    )
  } else {
    console.log(`ℹ️ Tài khoản Admin (${adminEmail}) đã tồn tại.`)
  }

  console.log("✨ Quá trình nạp dữ liệu mẫu hoàn tất!")
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi chạy seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
