import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = {
  default: "bg-slate-900 border-slate-700 text-slate-200",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-300 [&>svg]:text-blue-400",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 [&>svg]:text-emerald-400",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-300 [&>svg]:text-amber-400",
  destructive: "bg-red-500/10 border-red-500/30 text-red-300 [&>svg]:text-red-400",
}

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

const Alert = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
  const Icon = icons[variant] || Info

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative flex w-full items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
