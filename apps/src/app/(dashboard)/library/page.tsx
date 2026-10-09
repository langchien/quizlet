"use client"

import * as React from "react"
import { Plus, BookOpen } from "lucide-react"
import { CreateSetModal } from "@/components/modals/create-set-modal"
import { MergeSetsModal } from "@/components/modals/merge-sets-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { useLibrarySets } from "@/hooks/library"
import {
  LibraryHeader,
  LibraryToolbar,
  LibraryGridView,
  LibraryListView,
  LibraryDeleteDialog,
} from "@/components/library"

function LibraryContent() {
  const {
    viewMode,
    setViewMode,
    sets,
    folders,
    loading,
    search,
    setSearch,
    selectedFolder,
    setSelectedFolder,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    createModalOpen,
    setCreateModalOpen,
    editingSet,
    setEditingSet,
    mergeModalOpen,
    setMergeModalOpen,
    setToDelete,
    setSetToDelete,
    fetchSets,
    handleDuplicate,
    confirmDelete,
  } = useLibrarySets()

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <LibraryHeader
        onOpenMergeModal={() => setMergeModalOpen(true)}
        onOpenCreateModal={() => {
          setEditingSet(null)
          setCreateModalOpen(true)
        }}
      />

      {/* Filter & Search Bar */}
      <LibraryToolbar
        search={search}
        onSearchChange={setSearch}
        selectedFolder={selectedFolder}
        onSelectedFolderChange={setSelectedFolder}
        folders={folders}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(sb, so) => {
          setSortBy(sb)
          setSortOrder(so)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-border/60 bg-card flex flex-col gap-4 rounded-2xl border p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                </div>
                <Skeleton className="size-8 rounded-lg" />
              </div>
              <Skeleton className="h-3 w-1/2 rounded-md" />
              <div className="pt-2">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Chưa tìm thấy bộ thẻ nào"
          description={
            search || selectedFolder !== "all"
              ? "Không có bộ thẻ nào khớp với bộ lọc tìm kiếm hiện tại."
              : "Bắt đầu tạo bộ thẻ đầu tiên để ôn luyện từ vựng tiếng Nhật hiệu quả!"
          }
          actionLabel="Tạo bộ thẻ ngay"
          actionIcon={Plus}
          onAction={() => setCreateModalOpen(true)}
        />
      ) : viewMode === "grid" ? (
        <LibraryGridView
          sets={sets}
          onEdit={(set) => {
            setEditingSet(set)
            setCreateModalOpen(true)
          }}
          onDuplicate={handleDuplicate}
          onDelete={setSetToDelete}
        />
      ) : (
        <LibraryListView
          sets={sets}
          onEdit={(set) => {
            setEditingSet(set)
            setCreateModalOpen(true)
          }}
          onDuplicate={handleDuplicate}
          onDelete={setSetToDelete}
        />
      )}

      {/* Modals */}
      <CreateSetModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        editSet={editingSet}
        onSuccess={() => fetchSets()}
      />

      <MergeSetsModal
        open={mergeModalOpen}
        onOpenChange={setMergeModalOpen}
        onSuccess={() => fetchSets()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <LibraryDeleteDialog
        setToDelete={setToDelete}
        onClose={() => setSetToDelete(null)}
        onConfirmDelete={confirmDelete}
      />
    </div>
  )
}

export default function LibraryPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex animate-pulse flex-col gap-4 p-4">
          <div className="bg-card h-8 w-48 rounded-xl" />
          <div className="bg-card h-12 rounded-2xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <LibraryContent />
    </React.Suspense>
  )
}
