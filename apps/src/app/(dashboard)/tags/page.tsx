import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getTags } from "@/lib/dal/tags"
import { TagsClient } from "./tags-client"

export const metadata = {
  title: "Quản lý nhãn — NihoMemo",
  description:
    "Gắn nhãn và phân nhóm các thẻ từ vựng tiếng Nhật xuyên suốt tất cả bộ thẻ.",
}

export default async function TagsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const tags = await getTags(user.id)

  return <TagsClient initialTags={tags} />
}
