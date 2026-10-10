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

/**
 * Sub-component khung xương tải danh sách bộ thẻ
 */
function LibraryLoadingSkeleton() {
  return (
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
  )
}

function LibraryContent() {
  const library = useLibrarySets()

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <LibraryHeader
        onOpenMergeModal={library.openMergeModal}
        onOpenCreateModal={library.openCreateModal}
      />

      {/* Filter & Search Bar */}
      <LibraryToolbar
        search={library.search}
        onSearchChange={library.setSearch}
        selectedFolder={library.selectedFolder}
        onSelectedFolderChange={library.setSelectedFolder}
        folders={library.folders}
        sortBy={library.sortBy}
        sortOrder={library.sortOrder}
        onSortChange={library.handleSortChange}
        viewMode={library.viewMode}
        onViewModeChange={library.setViewMode}
      />

      {/* Content Rendering */}
      {library.loading ? (
        <LibraryLoadingSkeleton />
      ) : library.sets.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Chưa tìm thấy bộ thẻ nào"
          description={
            library.search || library.selectedFolder !== "all"
              ? "Không có bộ thẻ nào khớp với bộ lọc tìm kiếm hiện tại."
              : "Bắt đầu tạo bộ thẻ đầu tiên để ôn luyện từ vựng tiếng Nhật hiệu quả!"
          }
          actionLabel="Tạo bộ thẻ ngay"
          actionIcon={Plus}
          onAction={library.openCreateModal}
        />
      ) : library.viewMode === "grid" ? (
        <LibraryGridView
          sets={library.sets}
          onEdit={library.openEditModal}
          onDuplicate={library.handleDuplicate}
          onDelete={library.openDeleteDialog}
        />
      ) : (
        <LibraryListView
          sets={library.sets}
          onEdit={library.openEditModal}
          onDuplicate={library.handleDuplicate}
          onDelete={library.openDeleteDialog}
        />
      )}

      {/* Modals */}
      <CreateSetModal
        open={library.createModalOpen}
        onOpenChange={library.setCreateModalOpen}
        editSet={library.editingSet}
        onSuccess={() => library.fetchSets()}
      />

      <MergeSetsModal
        open={library.mergeModalOpen}
        onOpenChange={library.setMergeModalOpen}
        onSuccess={() => library.fetchSets()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <LibraryDeleteDialog
        setToDelete={library.setToDelete}
        onClose={library.closeDeleteDialog}
        onConfirmDelete={library.confirmDelete}
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
