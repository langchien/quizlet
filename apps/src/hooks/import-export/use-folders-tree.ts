"use client"

import * as React from "react"
import { getFoldersTreeAction } from "@/actions/folders"
import type { FolderNode } from "@/lib/dal/folders"

export interface FlattenedFolder {
  id: string
  name: string
}

export function useFoldersTree() {
  const [folders, setFolders] = React.useState<FolderNode[]>([])
  const [loading, setLoading] = React.useState(false)

  const loadFolders = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await getFoldersTreeAction()
      if (res.success && res.data) {
        setFolders(res.data)
      }
    } catch (err) {
      console.error("Lỗi khi tải cây thư mục:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const flattenedFolders = React.useMemo<FlattenedFolder[]>(() => {
    const list: FlattenedFolder[] = []
    const traverse = (nodes: FolderNode[], level = 0) => {
      for (const node of nodes) {
        list.push({
          id: node.id,
          name: `${"　".repeat(level)}📁 ${node.name}`,
        })
        if (node.children && node.children.length > 0) {
          traverse(node.children, level + 1)
        }
      }
    }
    traverse(folders, 0)
    return list
  }, [folders])

  return {
    folders,
    flattenedFolders,
    loading,
    refreshFolders: loadFolders,
  }
}
