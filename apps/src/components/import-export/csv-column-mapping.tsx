"use client"

import * as React from "react"
import { Layers } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import type { ColumnMapping } from "@/schemas/import-export"

interface SelectOption {
  value: string
  label: string
}

interface CsvColumnMappingProps {
  mapping: ColumnMapping
  headerOptions: SelectOption[]
  optionalHeaderOptions: SelectOption[]
  onUpdateTerm: (val: string) => void
  onUpdateReading: (val: string) => void
  onUpdateDefinition: (val: string) => void
  onUpdateExample: (val: string) => void
}

export function CsvColumnMapping({
  mapping,
  headerOptions,
  optionalHeaderOptions,
  onUpdateTerm,
  onUpdateReading,
  onUpdateDefinition,
  onUpdateExample,
}: CsvColumnMappingProps) {
  return (
    <div className="border-border/60 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
        <Layers className="text-primary size-3.5" />
        <span>Ánh xạ các cột CSV</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Field>
          <FieldLabel
            htmlFor="col-term"
            className="text-foreground text-[11px] font-medium"
          >
            Từ vựng (Term) *
          </FieldLabel>
          <Select
            id="col-term"
            items={headerOptions}
            value={String(mapping.termIndex)}
            onValueChange={(val) => val && onUpdateTerm(val)}
          >
            <SelectTrigger id="col-term" className="w-full">
              <SelectValue placeholder="Chọn cột từ vựng" />
            </SelectTrigger>
            <SelectContent>
              {headerOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="col-reading"
            className="text-foreground text-[11px] font-medium"
          >
            Cách đọc (Reading)
          </FieldLabel>
          <Select
            id="col-reading"
            items={optionalHeaderOptions}
            value={
              mapping.readingIndex !== undefined &&
              mapping.readingIndex !== null
                ? String(mapping.readingIndex)
                : "-1"
            }
            onValueChange={(val) => val && onUpdateReading(val)}
          >
            <SelectTrigger id="col-reading" className="w-full">
              <SelectValue placeholder="-- Không chọn (dùng Term) --" />
            </SelectTrigger>
            <SelectContent>
              {optionalHeaderOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="col-def"
            className="text-foreground text-[11px] font-medium"
          >
            Định nghĩa (Definition) *
          </FieldLabel>
          <Select
            id="col-def"
            items={headerOptions}
            value={String(mapping.definitionIndex)}
            onValueChange={(val) => val && onUpdateDefinition(val)}
          >
            <SelectTrigger id="col-def" className="w-full">
              <SelectValue placeholder="Chọn cột định nghĩa" />
            </SelectTrigger>
            <SelectContent>
              {headerOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="col-example"
            className="text-foreground text-[11px] font-medium"
          >
            Ví dụ (Example)
          </FieldLabel>
          <Select
            id="col-example"
            items={optionalHeaderOptions}
            value={
              mapping.exampleIndex !== undefined &&
              mapping.exampleIndex !== null
                ? String(mapping.exampleIndex)
                : "-1"
            }
            onValueChange={(val) => val && onUpdateExample(val)}
          >
            <SelectTrigger id="col-example" className="w-full">
              <SelectValue placeholder="-- Không có --" />
            </SelectTrigger>
            <SelectContent>
              {optionalHeaderOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  )
}
