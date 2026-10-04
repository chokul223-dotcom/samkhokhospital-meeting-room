import React from "react"
import { useApp } from "../../context/AppContext"

export const KcmhFooter: React.FC = () => {
  const { t } = useApp()

  return (
    <footer className="relative mt-12 py-6 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-semibold text-slate-600 dark:text-slate-300">
          Copyright 2026 © || Ver. 1.0.0 eBooking, {t.appName || "โรงพยาบาลสามโคก"}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          eBooking, Information Technology, Samkhok Hospital
        </p>
      </div>

    </footer>
  )
}
export default KcmhFooter
