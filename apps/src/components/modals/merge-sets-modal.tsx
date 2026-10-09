"use client"

import * as React from "react"
import { toast } from "sonner"
import { GitMerge } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { NativeSelect as Select } from "@/components/ui/native-select"
import { Label } from "@/components/ui/label"
import { mergeSetsAction } from "@/actions/sets"

interface MergeSetsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialTargetSetId?: string
}

export function MergeSetsModal({
  open,
  onOpenChange,
  onSuccess,
  initialTargetSetId,
}: MergeSetsModalProps) {
  const [sets, setSets] = React.useState<
    Array<{ id: string; name: string; cardCount: number }>
  >([])
  const [targetSetId, setTargetSetId] = React.useState(initialTargetSetId || "")
  const [selectedSourceIds, setSelectedSourceIds] = React.useState<string[]>([])
  const [deleteSources, setDeleteSources] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      let isMounted = true
      fetch("/api/sets?limit=100")
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .then((data) => {
          if (!isMounted) return
          const items = data.items || []
          setSets(items)
          setSelectedSourceIds([])
          if (initialTargetSetId) {
            setTargetSetId(initialTargetSetId)
          } else if (items.length > 0) {
            setTargetSetId((prev) => prev || items[0].id)
          }
        })
        .catch((err) => console.error("Error loading sets:", err))

      return () => {
        isMounted = false
      }
    }
  }, [open, initialTargetSetId])

  const toggleSource = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleMerge = () => {
    if (!targetSetId) {
      toast.error("Vui lòng chọn bộ thẻ đích")
      return
    }
    if (selectedSourceIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một bộ thẻ nguồn cần gộp")
      return
    }

    startTransition(async () => {
      try {
        const res = await mergeSetsAction({
          targetSetId,
          sourceSetIds: selectedSourceIds,
          deleteSources,
        })

        if (!res.success) {
          toast.error(res.error || "Gộp bộ thẻ thất bại")
          return
        }

        toast.success(
          `Đã gộp thành công ${res.data?.mergedCardsCount || 0} thẻ vào bộ đích!`
        )
        onOpenChange(false)
        onSuccess?.()
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Đã xảy ra lỗi khi gộp bộ thẻ"
        toast.error(message)
      }
    })
  }


  const availableSources = sets.filter((s) => s.id !== targetSetId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <GitMerge className="size-5" />
            </div>
            <div>
              <DialogTitle>Gộp nhiều bộ thẻ</DialogTitle>
              <DialogDescription>
                Sao chép toàn bộ thẻ từ các bộ thẻ nguồn sang bộ thẻ đích.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Bộ thẻ đích */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              1. Chọn bộ thẻ đích (sẽ nhận thêm thẻ)
            </Label>
            <Select
              className="w-full"
              value={targetSetId}
              onChange={(e) => {
                setTargetSetId(e.target.value)
                setSelectedSourceIds((prev) =>
                  prev.filter((id) => id !== e.target.value)
                )
              }}
            >
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  📚 {s.name} ({s.cardCount} thẻ)
                </option>
              ))}
            </Select>
          </div>

          {/* Chọn các bộ thẻ nguồn */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              2. Chọn các bộ thẻ nguồn cần gộp vào ({selectedSourceIds.length}{" "}
              đã chọn)
            </Label>
            <div className="border-border bg-muted/20 max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
              {availableSources.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center text-xs">
                  Không có bộ thẻ nào khác để gộp.
                </div>
              ) : (
                availableSources.map((s) => {
                  const isChecked = selectedSourceIds.includes(s.id)
                  return (
                    <label
                      key={s.id}
                      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSource(s.id)}
                          className="border-border rounded"
                        />
                        <span className="text-foreground font-medium">
                          {s.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        {s.cardCount} thẻ
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {/* Tự động xoá nguồn */}
          <label className="text-muted-foreground flex cursor-pointer items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              checked={deleteSources}
              onChange={(e) => setDeleteSources(e.target.checked)}
              className="border-border rounded"
            />
            <span>Xoá các bộ thẻ nguồn sau khi gộp thành công</span>
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            onClick={handleMerge}
            disabled={isPending || selectedSourceIds.length === 0}
          >
            {isPending ? "Đang gộp..." : "Xác nhận gộp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
