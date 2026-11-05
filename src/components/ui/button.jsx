import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  variants: {
    variant: {
      default: "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500",
      gold: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 hover:brightness-110",
      goldGlow: "bg-amber-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] hover:bg-amber-400",
      purple: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500",
      destructive: "bg-red-600/90 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
      outline: "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600",
      outlineGold: "border border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400",
      secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/60",
      ghost: "text-slate-300 hover:bg-slate-800/80 hover:text-white",
      link: "text-amber-400 underline-offset-4 hover:underline p-0 h-auto",
    },
    size: {
      default: "h-11 px-5 py-2.5",
      sm: "h-9 rounded-lg px-3.5 text-xs",
      lg: "h-12 rounded-xl px-7 text-base font-bold",
      xl: "h-14 rounded-2xl px-9 text-lg font-bold tracking-wide",
      icon: "h-10 w-10 p-0 rounded-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => (
  <button
    className={cn(
      buttonVariants.base,
      buttonVariants.variants.variant[variant],
      buttonVariants.variants.size[size],
      className
    )}
    ref={ref}
    {...props}
  />
))
Button.displayName = "Button"

export { Button }
