"use client"

import * as React from "react"
import { Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import type { AnkiFieldMapping } from "@/schemas/import-export"

interface SelectOption {
  value: string
  label: string
}

interface AnkiFieldMappingProps {
  modelName?: string
  fieldMapping: AnkiFieldMapping
  fieldOptions: SelectOption[]
  onFieldMappingChange: (key: keyof AnkiFieldMapping, value: string) => void
}

export function AnkiFieldMappingComponent({
  modelName,
  fieldMapping,
  fieldOptions,
  onFieldMappingChange,
}: AnkiFieldMappingProps) {
  return (
    <div className="border-border/60 bg-muted/30 flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
          <Layers className="text-primary size-3.5" />
          <span>Ánh xạ trường dữ liệu (Field Mapping)</span>
        </div>
        {modelName && (
          <Badge variant="secondary" className="text-[11px]">
            Model: {modelName}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Field>
          <FieldLabel
            htmlFor="map-term"
            className="text-foreground text-[11px] font-medium"
          >
            Từ vựng / Thuật ngữ (Term) *
          </FieldLabel>
          <Select
            id="map-term"
            items={fieldOptions}
            value={fieldMapping.term || "none"}
            onValueChange={(val) => val && onFieldMappingChange("term", val)}
          >
            <SelectTrigger id="map-term" className="w-full">
              <SelectValue placeholder="-- Chọn trường --" />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="map-reading"
            className="text-foreground text-[11px] font-medium"
          >
            Cách đọc / Furigana (Reading)
          </FieldLabel>
          <Select
            id="map-reading"
            items={fieldOptions}
            value={fieldMapping.reading || "none"}
            onValueChange={(val) => val && onFieldMappingChange("reading", val)}
          >
            <SelectTrigger id="map-reading" className="w-full">
              <SelectValue placeholder="-- Không chọn (dùng Term) --" />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="map-def"
            className="text-foreground text-[11px] font-medium"
          >
            Định nghĩa / Nghĩa (Definition) *
          </FieldLabel>
          <Select
            id="map-def"
            items={fieldOptions}
            value={fieldMapping.definition || "none"}
            onValueChange={(val) =>
              val && onFieldMappingChange("definition", val)
            }
          >
            <SelectTrigger id="map-def" className="w-full">
              <SelectValue placeholder="-- Chọn trường --" />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="map-example"
            className="text-foreground text-[11px] font-medium"
          >
            Câu ví dụ (Example)
          </FieldLabel>
          <Select
            id="map-example"
            items={fieldOptions}
            value={fieldMapping.example || "none"}
            onValueChange={(val) => val && onFieldMappingChange("example", val)}
          >
            <SelectTrigger id="map-example" className="w-full">
              <SelectValue placeholder="-- Không có --" />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  )
}
