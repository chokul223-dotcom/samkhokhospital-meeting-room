import React from "react"
import { CheckCircle2 } from "lucide-react"
import { useApp } from "../../context/AppContext"

export const Toast: React.FC = () => {
  const { toast } = useApp()

  if (!toast) return null

  return (
    <div className="fixed bottom-20 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 backdrop-blur-md px-5 py-3.5 text-white dark:text-slate-900 shadow-2xl border border-slate-700/50 dark:border-slate-200/50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <CheckCircle2 className="h-5 w-5 text-emerald-400 dark:text-emerald-600 flex-none" />
      <p className="text-sm font-semibold">{toast}</p>
    </div>
  )
}
export default Toast
