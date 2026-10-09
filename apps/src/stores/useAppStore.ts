import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { JLPTLevel } from "@/types"

interface StudyPreferences {
  shuffle: boolean
  reverse: boolean
  autoPlayAudio: boolean
  dailyGoalCards: number
}

interface AppState {
  // Sidebar state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // JLPT filter selection
  selectedJLPTLevel: JLPTLevel | "ALL"
  setSelectedJLPTLevel: (level: JLPTLevel | "ALL") => void

  // Study preferences
  studyPreferences: StudyPreferences
  updateStudyPreferences: (prefs: Partial<StudyPreferences>) => void

  // Reset store
  resetPreferences: () => void
}

const defaultPreferences: StudyPreferences = {
  shuffle: false,
  reverse: false,
  autoPlayAudio: true,
  dailyGoalCards: 20,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      selectedJLPTLevel: "ALL",
      setSelectedJLPTLevel: (level) => set({ selectedJLPTLevel: level }),

      studyPreferences: defaultPreferences,
      updateStudyPreferences: (prefs) =>
        set((state) => ({
          studyPreferences: { ...state.studyPreferences, ...prefs },
        })),

      resetPreferences: () =>
        set({
          studyPreferences: defaultPreferences,
          selectedJLPTLevel: "ALL",
        }),
    }),
    {
      name: "nihomemo-app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
