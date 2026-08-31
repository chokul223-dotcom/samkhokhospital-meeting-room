import React, { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { useApp } from "../../context/AppContext"

export const KcmhFooter: React.FC = () => {
  const { t } = useApp()
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScroll(true)
      } else {
        setShowScroll(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

      {/* Floating Scroll to top button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer border border-white/20"
          title="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  )
}
export default KcmhFooter
