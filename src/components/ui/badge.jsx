import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  secondary: "bg-slate-800 text-slate-300 border border-slate-700",
  destructive: "bg-red-500/15 text-red-400 border border-red-500/30",
  outline: "text-slate-300 border border-slate-700",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  purple: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
  gold: "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-sm",
  live: "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse",
}

function Badge({ className, variant = "default", children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
