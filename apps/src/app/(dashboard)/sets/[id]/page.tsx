import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getSetById } from "@/lib/dal/sets"
import { prisma } from "@/lib/prisma"
import { SetDetailClient, type SetDetailData } from "./set-detail-client"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return { title: "Chi tiết bộ thẻ | NihoMemo" }

  const set = await getSetById(id, user.id)
  if (!set) return { title: "Không tìm thấy bộ thẻ | NihoMemo" }

  return {
    title: `${set.name} | NihoMemo`,
    description:
      set.description ||
      `Bộ thẻ học tiếng Nhật ${set.name} với ${set.cardCount} thẻ.`,
  }
}

export default async function SetDetailPage({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const [set, availableTags] = await Promise.all([
    getSetById(id, user.id),
    prisma.tag.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  if (!set) {
    notFound()
  }

  return (
    <SetDetailClient
      initialSet={set as unknown as SetDetailData}
      availableTags={availableTags}
    />
  )
}
