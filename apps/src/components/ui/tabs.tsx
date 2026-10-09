"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
  ...props
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue || ""
  )

  const activeValue = value !== undefined ? value : internalValue
  const setActiveValue = (newVal: string) => {
    if (value === undefined) {
      setInternalValue(newVal)
    }
    onValueChange?.(newVal)
  }

  return (
    <TabsContext.Provider
      value={{ value: activeValue, onValueChange: setActiveValue }}
    >
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-muted/60 text-muted-foreground border-border/50 inline-flex h-10 items-center justify-center rounded-xl border p-1",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs")

  const isActive = ctx.value === value

  return (
    <button
      type="button"
      className={cn(
        "ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-xs"
          : "hover:bg-background/40 hover:text-foreground text-muted-foreground",
        className
      )}
      onClick={() => ctx.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsContent must be used within Tabs")

  if (ctx.value !== value) return null

  return (
    <div
      className={cn(
        "ring-offset-background animate-in fade-in-50 mt-3 duration-150 focus-visible:outline-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
