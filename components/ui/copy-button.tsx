"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
  className?: string
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={copyToClipboard}
          className={cn(
            "relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border bg-muted text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 border-input",
            className
          )}
          {...props}
        >
          <span className="sr-only">Copy</span>
          {hasCopied ? (
            <Check className="h-3 w-3 text-primary" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{hasCopied ? "Copied!" : "Copy to clipboard"}</p>
      </TooltipContent>
    </Tooltip>
  )
}
