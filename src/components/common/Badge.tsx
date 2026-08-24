import React from "react"
import { BookingStatus, RoomStatus } from "../../types"
import { useApp } from "../../context/AppContext"

interface BadgeProps {
  status: BookingStatus | RoomStatus | "inUse" | "free"
  size?: "sm" | "md"
}

export const Badge: React.FC<BadgeProps> = ({ status, size = "md" }) => {
  const { t } = useApp()

  const configMap: Record<string, {
    label: string
    bg: string
    text: string
    border: string
    dot: string
  }> = {
    pending: {
      label: t.pending,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200/80 dark:border-amber-800/60",
      dot: "bg-amber-500",
    },
    approved: {
      label: t.approved,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200/80 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
    },
    rejected: {
      label: t.rejected,
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200/80 dark:border-rose-800/60",
      dot: "bg-rose-500",
    },
    cancelled: {
      label: t.cancelled,
      bg: "bg-slate-100 dark:bg-slate-800/60",
      text: "text-slate-600 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-700",
      dot: "bg-slate-400",
    },
    available: {
      label: t.available,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200/80 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
    },
    free: {
      label: t.free,
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200/80 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
    },
    inUse: {
      label: t.inUse,
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200/80 dark:border-rose-800/60",
      dot: "bg-rose-500 animate-pulse-dot",
    },
    maintenance: {
      label: t.maintenance,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200/80 dark:border-amber-800/60",
      dot: "bg-amber-500",
    },
  }

  const current = configMap[status] || configMap.cancelled
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-medium transition-colors ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-none ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  )
}
export default Badge
