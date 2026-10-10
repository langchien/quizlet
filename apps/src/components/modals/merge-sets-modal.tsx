"use client"

import * as React from "react"
import { toast } from "sonner"
import { GitMerge, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { mergeSetsAction, getUserSetsAction } from "@/actions/sets"

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
      getUserSetsAction({ limit: 100 })
        .then((res) => {
          if (!isMounted) return
          const items = res.success && res.data ? res.data.items : []
          setSets(items)
          setSelectedSourceIds([])
          if (initialTargetSetId) {
            setTargetSetId(initialTargetSetId)
          } else if (items.length > 0) {
            setTargetSetId((prev) => prev || items[0].id)
          }
        })
        .catch((err) => console.error("Lỗi tải danh sách bộ thẻ:", err))

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

  const setOptions = React.useMemo(
    () =>
      sets.map((s) => ({
        value: s.id,
        label: `📚 ${s.name} (${s.cardCount} thẻ)`,
      })),
    [sets]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <GitMerge className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Gộp nhiều bộ thẻ</DialogTitle>
              <DialogDescription>
                Sao chép toàn bộ thẻ từ các bộ thẻ nguồn sang bộ thẻ đích.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <FieldGroup className="gap-4">
            {/* Bộ thẻ đích */}
            <Field>
              <FieldLabel
                htmlFor="target-set-select"
                className="text-xs font-semibold"
              >
                1. Chọn bộ thẻ đích (sẽ nhận thêm thẻ)
              </FieldLabel>
              <Select
                items={setOptions}
                value={targetSetId}
                onValueChange={(val) => {
                  if (!val) return
                  setTargetSetId(val)
                  setSelectedSourceIds((prev) =>
                    prev.filter((id) => id !== val)
                  )
                }}
              >
                <SelectTrigger id="target-set-select" className="w-full">
                  <SelectValue placeholder="Chọn bộ thẻ đích (sẽ nhận thêm thẻ)..." />
                </SelectTrigger>
                <SelectContent>
                  {setOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* Chọn các bộ thẻ nguồn */}
            <Field>
              <FieldLabel className="text-xs font-semibold">
                2. Chọn các bộ thẻ nguồn cần gộp vào ({selectedSourceIds.length}{" "}
                đã chọn)
              </FieldLabel>
              <div className="border-border bg-muted/20 flex max-h-48 flex-col gap-1 overflow-y-auto rounded-xl border p-2">
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
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleSource(s.id)}
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
            </Field>

            {/* Tự động xoá nguồn */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="delete-sources-check"
                checked={deleteSources}
                onCheckedChange={(checked) => setDeleteSources(!!checked)}
              />
              <FieldLabel
                htmlFor="delete-sources-check"
                className="text-muted-foreground cursor-pointer text-xs font-normal select-none"
              >
                Xoá các bộ thẻ nguồn sau khi gộp thành công
              </FieldLabel>
            </div>
          </FieldGroup>
        </div>

        <DialogFooter className="pt-2">
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
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Đang gộp..." : "Xác nhận gộp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
