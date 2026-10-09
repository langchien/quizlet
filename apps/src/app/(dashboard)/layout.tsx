"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { CommandPalette } from "@/components/command-palette"
import { CreateSetModal } from "@/components/modals/create-set-modal"
import { CreateFolderModal } from "@/components/modals/create-folder-modal"
import { CreateTagModal } from "@/components/modals/create-tag-modal"
import { useAuthStore } from "@/stores/useAuthStore"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchCurrentUser } = useAuthStore()

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  // Modals state
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  const [createSetOpen, setCreateSetOpen] = React.useState(false)
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false)
  const [createTagOpen, setCreateTagOpen] = React.useState(false)

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
    <div className="bg-background text-foreground selection:bg-primary/20 flex min-h-screen">
      {/* Background radial gradient subtle effect */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-20" />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onOpenCreateSet={handleOpenCreateSet}
          onOpenCreateFolder={handleOpenCreateFolder}
          onEditFolder={handleEditFolder}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div className="animate-in fade-in-0 fixed inset-0 z-40 flex duration-200 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="bg-card animate-in slide-in-from-left relative z-50 flex w-72 flex-col shadow-2xl duration-200">
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileSidebarOpen(false)}
              onOpenCreateSet={(folderId) => {
                setMobileSidebarOpen(false)
                handleOpenCreateSet(folderId)
              }}
              onOpenCreateFolder={(parentId) => {
                setMobileSidebarOpen(false)
                handleOpenCreateFolder(parentId)
              }}
              onEditFolder={(f) => {
                setMobileSidebarOpen(false)
                handleEditFolder(f)
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onOpenCreateSet={() => handleOpenCreateSet()}
          onOpenCreateFolder={() => handleOpenCreateFolder()}
          onOpenCreateTag={() => setCreateTagOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Modals & Dialogs */}
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
          // Trigger refresh if needed
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
