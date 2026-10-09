export interface LibraryStudySetItem {
  id: string
  name: string
  description?: string | null
  sourceLanguage: string
  targetLanguage: string
  folderId?: string | null
  userId: string
  cardCount: number
  createdAt: string
  updatedAt: string
  lastStudiedAt?: string | null
  folder?: { id: string; name: string } | null
  progress?: {
    mastered: number
    learning: number
    new: number
    percentage: number
  }
}

export interface LibraryFolderItem {
  id: string
  name: string
}
