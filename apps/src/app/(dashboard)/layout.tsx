"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CommandPalette } from "@/components/command-palette"
import { CreateSetModal } from "@/components/modals/create-set-modal"
import { CreateFolderModal } from "@/components/modals/create-folder-modal"
import { CreateTagModal } from "@/components/modals/create-tag-modal"
import { ShortcutsCheatsheetModal } from "@/components/modals/shortcuts-cheatsheet-modal"
import { useAuthStore } from "@/stores/useAuthStore"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchCurrentUser } = useAuthStore()

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  const [createSetOpen, setCreateSetOpen] = React.useState(false)
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false)
  const [createTagOpen, setCreateTagOpen] = React.useState(false)
  const [shortcutsCheatsheetOpen, setShortcutsCheatsheetOpen] =
    React.useState(false)

  // Edit states
  const [editingFolder, setEditingFolder] = React.useState<{
    id: string
    name: string
    description?: string | null
    parentId?: string | null
  } | null>(null)
  const [targetFolderId, setTargetFolderId] = React.useState<
    string | null | undefined
  >(null)

  React.useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault()
        setShortcutsCheatsheetOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  const handleOpenCreateSet = (folderId?: string) => {
    setTargetFolderId(folderId || null)
    setCreateSetOpen(true)
  }

  const handleOpenCreateFolder = (parentId?: string) => {
    setEditingFolder(null)
    setTargetFolderId(parentId || null)
    setCreateFolderOpen(true)
  }

  const handleEditFolder = (folder: {
    id: string
    name: string
    description?: string | null
    parentId?: string | null
  }) => {
    setEditingFolder(folder)
    setCreateFolderOpen(true)
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 flex min-h-screen flex-col [--header-height:calc(--spacing(14))]">
      {/* Background radial gradient subtle effect */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-20" />

      <SidebarProvider className="flex flex-col">
        {/* Full-width sticky header on top */}
        <SiteHeader
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onOpenCreateSet={() => handleOpenCreateSet()}
          onOpenCreateFolder={() => handleOpenCreateFolder()}
          onOpenCreateTag={() => setCreateTagOpen(true)}
          onOpenShortcuts={() => setShortcutsCheatsheetOpen(true)}
        />

        {/* Sidebar + Main Content Area */}
        <div className="flex flex-1">
          <AppSidebar
            onOpenCreateSet={handleOpenCreateSet}
            onOpenCreateFolder={handleOpenCreateFolder}
            onEditFolder={handleEditFolder}
            onOpenShortcuts={() => setShortcutsCheatsheetOpen(true)}
          />

          <SidebarInset>
            <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-8">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Modals & Dialogs */}
      <ShortcutsCheatsheetModal
        open={shortcutsCheatsheetOpen}
        onOpenChange={setShortcutsCheatsheetOpen}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenCreateSet={() => handleOpenCreateSet()}
        onOpenCreateFolder={() => handleOpenCreateFolder()}
      />

      <CreateSetModal
        open={createSetOpen}
        onOpenChange={setCreateSetOpen}
        defaultFolderId={targetFolderId}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent("refresh-library"))
        }}
      />

      <CreateFolderModal
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        editFolder={editingFolder}
        defaultParentId={targetFolderId}
        onSuccess={() => {
          window.location.reload()
        }}
      />

      <CreateTagModal
        open={createTagOpen}
        onOpenChange={setCreateTagOpen}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent("refresh-tags"))
        }}
      />
    </div>
  )
}
