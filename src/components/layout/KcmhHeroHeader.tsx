import React from "react"
import { useApp } from "../../context/AppContext"

export const KcmhHeroHeader: React.FC = () => {
  const { t } = useApp()

  return (
    <div className="py-6 sm:py-8 text-center select-none animate-in fade-in duration-300">
      {/* Hospital Logo & Title */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
        {/* Hospital Logo Emblem */}
        <div className="flex-none flex items-center justify-center">
          <img
            src="/logo.png"
            alt={t.appName || "โรงพยาบาลสามโคก"}
            className="w-9 h-9 sm:w-12 sm:h-12 object-contain drop-shadow-sm"
          />
        </div>

        {/* Main Branding Title */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
          <span>eBooking, </span>
          <span className="text-slate-700 dark:text-slate-200">
            {t.appName || "โรงพยาบาลสามโคก"}
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400">
        {t.appDesc || "ระบบจองห้องประชุมและห้องอบรม"} {t.appName || "โรงพยาบาลสามโคก"}
      </p>
    </div>
  )
}
export default KcmhHeroHeader
