import React from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen, Sparkles } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Gradients & Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="from-primary/15 absolute -top-[40%] left-[20%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr via-rose-500/10 to-transparent blur-3xl" />
        <div className="absolute right-[10%] -bottom-[30%] h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-indigo-500/15 via-sky-500/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-20" />
      </div>

      {/* Top Navigation Bar */}
      <header className="absolute top-0 flex w-full max-w-7xl items-center justify-between p-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="from-primary text-primary-foreground shadow-primary/20 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br to-rose-600 shadow-md">
            <BookOpen className="size-5 transition-transform group-hover:rotate-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-lg font-bold tracking-tight">
              NihoMemo
            </span>
            <span className="font-japanese text-muted-foreground text-[11px] font-medium">
              日本メモ • Học tiếng Nhật
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="border-border/60 bg-background/60 text-muted-foreground hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur-md sm:flex">
            <Sparkles className="size-3 text-amber-500" />
            <span>Spaced Repetition & Quizlet Clone</span>
          </div>
          <ModeToggle />
        </div>
      </header>

      {/* Main Form Container */}
      <main className="z-10 w-full max-w-md px-4 py-12 sm:px-6">
        {children}
      </main>

      {/* Footer Branding */}
      <footer className="text-muted-foreground absolute bottom-4 text-center text-xs">
        © 2026 NihoMemo. Đồng hành cùng bạn chinh phục JLPT.
      </footer>
    </div>
  )
}
