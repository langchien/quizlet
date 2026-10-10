"use client"

import * as React from "react"
import { CreateTagModal } from "@/components/modals/create-tag-modal"
import type { TagWithCount } from "@/lib/dal/tags"
import {
  TagsHeader,
  TagsSearchBar,
  TagCard,
  TagEmptyState,
} from "@/components/tags"
import { ConfirmDeleteDialog } from "@/components/common"
import { useTagsManager } from "@/hooks/tags"

interface TagsClientProps {
  initialTags: TagWithCount[]
}

export function TagsClient({ initialTags }: TagsClientProps) {
  const {
    filteredTags,
    searchTerm,
    setSearchTerm,
    createModalOpen,
    setCreateModalOpen,
    editingTag,
    handleOpenCreateModal,
    handleOpenEditModal,
    refreshTags,
    isDeleteOpen,
    tagToDelete,
    isDeleting,
    handleOpenDelete,
    handleCloseDelete,
    confirmDelete,
  } = useTagsManager({ initialTags })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <TagsHeader onCreateClick={handleOpenCreateModal} />

      {/* Search Bar */}
      <TagsSearchBar value={searchTerm} onChange={setSearchTerm} />

      {/* Tags Grid or Empty State */}
      {filteredTags.length === 0 ? (
        <TagEmptyState
          search={searchTerm}
          onCreateClick={handleOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Tạo/Sửa Tag */}
      <CreateTagModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        editTag={editingTag}
        onSuccess={refreshTags}
      />

      {/* Modal Xác nhận xoá dùng chung */}
      <ConfirmDeleteDialog
        isOpen={isDeleteOpen}
        targetItem={tagToDelete}
        isDeleting={isDeleting}
        title={(tag) => `Xác nhận xoá nhãn "${tag.name}"?`}
        description={(tag) => (
          <span>
            Bạn có chắc chắn muốn xoá nhãn &quot;{tag.name}&quot;? Việc này sẽ
            gỡ bỏ nhãn khỏi tất cả {tag.cardCount} thẻ liên quan, nhưng{" "}
            <strong className="text-foreground">không xoá các thẻ</strong> của
            bạn.
          </span>
        )}
        confirmText="Xoá nhãn"
        onClose={handleCloseDelete}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
