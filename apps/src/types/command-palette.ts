export interface SearchResults {
  sets: Array<{
    id: string
    name: string
    description?: string | null
    cardCount: number
    folder?: { id: string; name: string } | null
  }>
  cards: Array<{
    id: string
    term: string
    reading: string
    definition: string
    studySetId: string
    studySetName: string
    tags?: Array<{ id: string; name: string; color: string }>
  }>
  folders: Array<{
    id: string
    name: string
    description?: string | null
    _count?: { studySets: number; children: number }
  }>
  tags: Array<{
    id: string
    name: string
    color: string
    cardCount: number
  }>
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenCreateSet?: () => void
  onOpenCreateFolder?: () => void
}
