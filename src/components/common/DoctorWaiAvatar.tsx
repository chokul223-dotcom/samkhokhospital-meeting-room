import React, { useState } from "react"
import { Heart } from "lucide-react"
import { useApp } from "../../context/AppContext"

export const DoctorWaiAvatar: React.FC = () => {
  const { language } = useApp()
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHeart, setShowHeart] = useState(false)

  // Handle avatar click: just show the heart reaction
  const handleDoctorClick = () => {
    setShowHeart(true)
    setTimeout(() => {
      setShowHeart(false)
    }, 1200)
  }

  return (
    <div
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-6 md:right-8 z-30 flex flex-col items-center select-none pointer-events-auto"
      style={{ maxWidth: "340px" }}
    >
      {/* ─── Doctor Character & Animation Container ─── */}
      {isMinimized ? (
        /* Minimized Floating Badge */
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false)
            handleDoctorClick()
          }}
          className="group flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-900/90 py-1.5 px-3.5 shadow-xl border border-sky-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer"
          title={language === "th" ? "คลิกเพื่อเรียกคุณหมอ" : "Click to show Doctor"}
        >
          <div className="h-8 w-8 rounded-full overflow-hidden border border-sky-400 bg-sky-50 flex items-center justify-center">
            <img
              src="/doctor-wai.png"
              alt="Doctor Avatar"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
            {language === "th" ? "คุณหมอต้อนรับ 🙏" : "Doctor Welcome 🙏"}
          </span>
        </button>
      ) : (
        /* Full Animated Doctor Character */
        <div
          className="relative group cursor-pointer flex flex-col items-center"
          onClick={handleDoctorClick}
          title={
            language === "th"
              ? "คลิกเพื่อทักทายคุณหมอ 🙏"
              : "Click to greet Doctor 🙏"
          }
        >
          {/* Floating Heart reaction on click */}
          {showHeart && (
            <div className="absolute -top-6 z-40 pointer-events-none animate-ping text-rose-500">
              <Heart className="h-7 w-7 fill-rose-500" />
            </div>
          )}

          {/* Doctor Image with Wai Movement */}
          <div className="relative animate-doctor-wai origin-bottom filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)] group-hover:brightness-105 transition-all">
            <img
              src="/doctor-wai.png"
              alt={language === "th" ? "คุณหมอผู้หญิงพนมมือไหว้" : "Female Doctor Wai Greeting"}
              className="h-44 sm:h-52 md:h-60 max-h-[36vh] w-auto object-contain pointer-events-none"
              loading="eager"
            />
          </div>

          {/* Soft Dynamic Ground Shadow */}
          <div className="w-20 sm:w-24 md:w-28 h-3 rounded-full bg-slate-900/40 dark:bg-black/60 blur-[3px] animate-doctor-shadow -mt-1 pointer-events-none" />

          {/* Minimize / Info Tooltip on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 right-0 translate-y-full pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(true)
              }}
              className="text-[10px] font-semibold text-white/90 hover:text-white bg-black/60 hover:bg-black/85 px-2.5 py-0.5 rounded-full backdrop-blur-xs cursor-pointer shadow-xs transition-colors"
            >
              {language === "th" ? "ย่อขนาด" : "Minimize"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorWaiAvatar
