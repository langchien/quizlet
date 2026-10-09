import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getMistakeCards } from "@/lib/dal/study"
import { MistakesClient, type MistakeCard } from "./mistakes-client"

export default async function ReviewMistakesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Nạp danh sách lỗi sai ban đầu trực tiếp từ Data Access Layer
  const items = await getMistakeCards(user.id)

  return <MistakesClient initialItems={items as unknown as MistakeCard[]} />
}
