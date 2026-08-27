import React, { useState, useEffect } from "react"
import { Sparkles, X, Volume2, VolumeX, Heart } from "lucide-react"
import { useApp } from "../../context/AppContext"

export const DoctorWaiAvatar: React.FC = () => {
  const { t } = useApp()
  const [showBubble, setShowBubble] = useState(true)
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showHeart, setShowHeart] = useState(false)

  const greetings = [
    {
      title: "สวัสดีค่ะ ยินดีต้อนรับค่ะ 🙏",
      subtitle: "ระบบจองห้องประชุม รพ.สามโคก พร้อมให้บริการค่ะ",
    },
    {
      title: "ต้องการความช่วยเหลือ? 🏥",
      subtitle: "ติดต่อฝ่ายสารสนเทศ โทร 02-199-3791-2 ได้นะคะ",
    },
    {
      title: "ขอให้การประชุมราบรื่นนะคะ ✨",
      subtitle: "ตรวจสอบตารางห้องประชุมได้สะดวกรวดเร็วค่ะ",
    },
    {
      title: "ยินดีต้อนรับบุคลากรทุกท่านค่ะ 💙",
      subtitle: "กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบได้เลยค่ะ",
    },
  ]

  // Play gentle chime using Web Audio API (Zero external dependencies)
  const playGentleChime = () => {
    if (!soundEnabled) return
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (Soft joyful pentatonic)

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, now + i * 0.08)
        
        gain.gain.setValueAtTime(0, now + i * 0.08)
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.7)
      })
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }

  // Handle avatar click
  const handleDoctorClick = () => {
    setGreetingIndex((prev) => (prev + 1) % greetings.length)
    setShowBubble(true)
    setShowHeart(true)
    playGentleChime()
    setTimeout(() => setShowHeart(false), 1200)
  }

  // Auto rotate greeting after some time if open
  useEffect(() => {
    if (!showBubble) return
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 9000)
    return () => clearInterval(interval)
  }, [showBubble, greetings.length])

  return (
    <div
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-6 md:right-8 z-30 flex flex-col items-center select-none pointer-events-auto"
      style={{ maxWidth: "260px" }}
    >
      {/* ─── Floating Speech Bubble ─── */}
      {showBubble && !isMinimized && (
        <div className="relative mb-2 w-52 sm:w-60 rounded-2xl bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md border border-sky-100 dark:border-slate-700/80 animate-speech-pop text-left">
          {/* Close Bubble Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowBubble(false)
            }}
            className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="ปิดข้อความ"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSoundEnabled((v) => !v)
            }}
            className="absolute top-2 right-8 h-5 w-5 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={soundEnabled ? "ปิดเสียงทักทาย" : "เปิดเสียงทักทาย"}
          >
            {soundEnabled ? (
              <Volume2 className="h-3 w-3 text-sky-500" />
            ) : (
              <VolumeX className="h-3 w-3" />
            )}
          </button>

          {/* Content */}
          <div className="pr-12">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                {greetings[greetingIndex].title}
              </p>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">
              {greetings[greetingIndex].subtitle}
            </p>
          </div>

          {/* Speech bubble pointer / arrow */}
          <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/95 dark:border-t-slate-900/95 filter drop-shadow-xs" />
        </div>
      )}

      {/* ─── Doctor Character & Animation Container ─── */}
      {isMinimized ? (
        /* Minimized Floating Badge */
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false)
            setShowBubble(true)
            playGentleChime()
          }}
          className="group flex items-center gap-2 rounded-full bg-white/95 dark:bg-slate-900/90 py-1.5 px-3 shadow-lg border border-sky-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer"
          title="คลิกเพื่อแสดงคุณหมอ"
        >
          <div className="h-7 w-7 rounded-full overflow-hidden border border-sky-400 bg-sky-50">
            <img
              src="/doctor-wai.png"
              alt="Doctor Avatar"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
            คุณหมอต้อนรับ 🙏
          </span>
        </button>
      ) : (
        /* Full Animated Doctor Character */
        <div
          className="relative group cursor-pointer flex flex-col items-center"
          onClick={handleDoctorClick}
          title="คลิกเพื่อทักทายคุณหมอ 🙏"
        >
          {/* Floating Heart reaction on click */}
          {showHeart && (
            <div className="absolute -top-6 z-40 pointer-events-none animate-ping text-rose-500">
              <Heart className="h-6 w-6 fill-rose-500" />
            </div>
          )}

          {/* Sparkles around hands during wai */}
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 pointer-events-none z-30">
            <Sparkles className="h-5 w-5 text-amber-400 animate-sparkle" />
          </div>
          <div className="absolute top-[36%] right-[25%] pointer-events-none z-30">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-sparkle delay-150" />
          </div>

          {/* Doctor Image with Wai Movement */}
          <div className="relative animate-doctor-wai origin-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)] group-hover:brightness-105 transition-all">
            <img
              src="/doctor-wai.png"
              alt="คุณหมอผู้หญิงพนมมือไหว้"
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
              className="text-[9px] font-semibold text-white/80 hover:text-white bg-black/50 hover:bg-black/75 px-2 py-0.5 rounded-full backdrop-blur-xs cursor-pointer shadow-xs transition-colors"
            >
              ย่อขนาด
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorWaiAvatar
