import React from "react"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  colorClass: string
  iconBgClass: string
  subText?: string
  trend?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  colorClass,
  iconBgClass,
  subText,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        onClick
          ? "cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {label}
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
              {subText}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBgClass} ${colorClass}`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}
export default StatCard
