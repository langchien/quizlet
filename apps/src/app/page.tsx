"use client"

import * as React from "react"
import { useLanding } from "@/hooks/landing"
import {
  LandingHeader,
  LandingHero,
  LandingDbStatus,
  LandingJlptSelector,
  LandingStudyModes,
  LandingTechStack,
  LandingFooter,
} from "@/components/landing"

export default function HomePage() {
  const { auth, health, jlpt } = useLanding()

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 relative flex min-h-screen flex-col">
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 dark:opacity-25" />

      {/* Navigation Top Bar */}
      <LandingHeader {...auth} />

      {/* Main Content Area */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <LandingHero user={auth.user} isAuthenticated={auth.isAuthenticated} />

        <LandingDbStatus {...health} />

        <LandingJlptSelector {...jlpt} />

        <LandingStudyModes />

        <LandingTechStack />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
