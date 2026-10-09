import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getStudySetForStudyPage } from "@/lib/dal/study"
import { StudyModeClient } from "./study-mode-client"

interface StudyModeSelectionPageProps {
  params: Promise<{ setId: string }>
}

export default async function StudyModeSelectionPage({
  params,
}: StudyModeSelectionPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { setId } = await params
  const data = await getStudySetForStudyPage(user.id, setId)

  if (!data) {
    redirect("/library")
  }

  return <StudyModeClient setDetail={data.setDetail} tags={data.tags} />
}
