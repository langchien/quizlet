"use client"

import * as React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface AuthCardWrapperProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  footerText: string
  footerLinkText: string
  footerLinkHref: string
  className?: string
}

export function AuthCardWrapper({
  icon,
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  className,
}: AuthCardWrapperProps) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-card/85 hover:shadow-primary/5 shadow-2xl backdrop-blur-xl transition-all",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-2 pb-6 text-center">
        <div className="bg-primary/10 text-primary ring-primary/25 mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl ring-1">
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">{children}</CardContent>

      <Separator className="bg-border/60" />

      <CardFooter className="text-muted-foreground flex items-center justify-center p-6 text-center text-xs">
        <span>{footerText}</span>
        <Link
          href={footerLinkHref}
          className="text-primary ml-1.5 font-semibold hover:underline"
        >
          {footerLinkText}
        </Link>
      </CardFooter>
    </Card>
  )
}
