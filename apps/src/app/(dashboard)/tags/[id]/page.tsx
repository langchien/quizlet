import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getTagWithCards } from "@/lib/dal/tags"
import { TagDetailClient } from "./tag-detail-client"

interface TagPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TagPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return { title: "Chi tiết nhãn — NihoMemo" }

  const result = await getTagWithCards(id, user.id)
  if (!result) return { title: "Không tìm thấy nhãn — NihoMemo" }

  return {
    title: `Nhãn "${result.tag.name}" — NihoMemo`,
    description: `Danh sách các thẻ từ vựng được gắn nhãn ${result.tag.name}.`,
  }
}

export default async function TagCardsPage({ params }: TagPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const data = await getTagWithCards(id, user.id)

  if (!data) {
    notFound()
  }

  return <TagDetailClient tag={data.tag} initialCards={data.cards} />
}
